"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy import func
from api.models import db, User, Story, Chapter, Comment, Follower, UserRole
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

def get_current_user():
    uid = get_jwt_identity()
    return db.session.get(User, uid) if uid is not None else None 


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/user', methods=['GET'])
def get_user(): 

    users = User.query.all()

    return jsonify([
        user.serialize() for user in users
        ]), 200

@api.route('/auth/register', methods=['POST'])
def register(): 
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    display_name = (data.get("display_name") or "").strip()
    if not email or not password or not display_name:
        return jsonify({"error": "missing_fields"}), 400
    
    pwd_hash = password 

    u = User(email=email, password=pwd_hash, display_name=display_name)
    db.session.add(u)
    db.session.commit()
    return jsonify(u.serialize()), 201

@api.route('/auth/login', methods=['POST'])
def login(): 
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    if not email or not password: 
        return jsonify({"error": "missing_fields"}), 400 
    
    u = User.query.filter_by(email=email).first()
    if not u or u.password != password: 
        return jsonify({"error": "invalid_credentials"}), 401

    return jsonify({
        "access_token": create_access_token(identity=u.id),
        "refresh_token": create_refresh_token(identity=u.id),
        "user": u.serialize()
    }), 200

@api.route('/stories', methods=['POST'])
@jwt_required()
def create_story():
    user = get_current_user()
    if not user: 
        return jsonify({"error": "unauthorized"}), 401
    
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    synopsis = (data.get("synopsis") or "").strip()
    if not title: 
        return jsonify({"error": "title required"}), 400
    
    s = Story(author_id=user.id, title=title, synopsis=synopsis, status="draft")
    db.session.add(s)
    db.session.commit()
    return jsonify(s.serialize()), 201

@api.route('/stories', methods=['GET'])
def list_stories():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 10)), 1), 50)
    q = Story.query.order_by(Story.published_at.desc().nullslast(), Story.id.desc())
    pag = q.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [s.serialize() for s in pag.items],
        "page": pag.page, "per_page": pag.per_page, "total": pag.total
    })

@api.route('/stories/<int:story_id>', methods=['GET'])
def get_story(story_id: int):
    s = db.session.get(Story, story_id)
    if not s: return jsonify({"error": "not_found"}), 404
    return jsonify(s.serialize())

#We use patch in order to partially update the record, PUT completly overrides the record.
@api.route('/stories/<int:story_id>', methods=['PATCH'])
@jwt_required()
def update_story(story_id:int):
    user = get_current_user()
    s = db.session.get(Story, story_id)
    if not s: return jsonify({"error": "not_found"}), 404 
    if s.author_id != user.id: 
        return jsonify({"error": "forbidden"}), 403 

    data = request.get_json() or {}
    for field in ("title", "synopsis", "status"):
        if field in data and data[field] is not None: 
            setattr(s, field, data[field])
    
    db.session.commit()
    return jsonify(s.serialize())

@api.route('/stories/<int:story_id>/chapters', methods=['POST'])
@jwt_required()
def create_chapter(story_id:int):
    user = get_current_user()
    s = db.session.get(Story, story_id)
    if not s: return jsonify({"error": "not_found"}), 404 
    if s.author_id != user.id: 
        return jsonify({"error": "forbidden"}), 403 
    
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    number = data.get("number")
    content = (data.get("content") or "").strip()
    status = data.get("status", "draft")
    if not title or not number or not content: 
        return jsonify({"error": "missing_fields"}), 400
    
    c = Chapter(story_id=story_id, title=title, number=int(number), content=content, status=status)
    db.session.add(c)
    db.session.commit()
    return jsonify(c.serialize()), 201

@api.route('/stories/<int:story_id>/chapters/<int:chapter_id>', methods=['DELETE'])
@jwt_required()
def delete_chapter(story_id: int, chapter_id: int):
    user = get_current_user()
    c = Chapter.query.filter_by(id=chapter_id, story_id=story_id).first()
    if not c or c.deleted_at is not None:
        return jsonify({"error": "not_found"}), 404
    s = db.session.get(Story, story_id)
    if s.author_id != user.id and user.user_role != UserRole.ADMIN:
        return jsonify({"error": "forbidden"}), 403

    hard = (request.args.get("hard", "false").lower() == "true")

    if hard:
        db.session.delete(c)
    else:
        c.deleted_at = func.now()
        c.status = "hidden"

    db.session.commit()
    return "", 204

@api.route("/stories/<int:story_id>/chapters", methods=["GET"])
def list_chapters(story_id: int):
    items = Chapter.query.filter_by(story_id=story_id).order_by(Chapter.number.asc()).all()
    return jsonify([c.serialize() for c in items])

@api.route("/comments", methods=["POST"])
@jwt_required()
def create_comment():
    user = get_current_user()
    data = request.get_json() or {}
    story_id = data.get("story_id")
    text = (data.get("text") or "").strip()
    if not story_id or not text:
        return jsonify({"error": "missing_fields"}), 400
    if len(text) > 280:
        return jsonify({"error": "too_long"}), 400

    c = Comment(user_id=user.id, story_id=int(story_id), text=text)
    db.session.add(c)
    db.session.commit()
    return jsonify(c.serialize()), 201

@api.route('/stories/<int:story_id>/chapters/<int:chapter_id>', methods=['DELETE'])
@jwt_required()
def delete_chapter(story_id: int, chapter_id: int):
    user = get_current_user()

    c = Chapter.query.filter_by(id=chapter_id, story_id=story_id).first()
    if not c or c.deleted_at is not None:
        return jsonify({"error": "not_found"}), 404

    # Autorización: dueño de la historia o admin
    s = db.session.get(Story, story_id)
    if s.author_id != user.id and user.user_role != UserRole.ADMIN:
        return jsonify({"error": "forbidden"}), 403

    hard = (request.args.get("hard", "false").lower() == "true")

    if hard:
        db.session.delete(c)
    else:
        c.deleted_at = func.now()
        c.status = "hidden"

    db.session.commit()
    return "", 204

@api.route("/comments", methods=["GET"])
def list_comments():
    story_id = request.args.get("story_id", type=int)
    q = Comment.query
    if story_id:
        q = q.filter_by(story_id=story_id)
    q = q.order_by(Comment.created_at.desc())
    return jsonify([c.serialize() for c in q.limit(100).all()])

@api.route("/follows", methods=["POST"])
@jwt_required()
def follow():
    user = get_current_user()
    data = request.get_json() or {}
    following_id = data.get("following_id")
    if not following_id or int(following_id) == user.id:
        return jsonify({"error": "invalid_follow"}), 400

    f = Follower(follower_id=user.id, following_id=int(following_id))
    db.session.add(f)
    db.session.commit()
    return jsonify(f.serialize()), 201

@api.route("/follows", methods=["DELETE"])
@jwt_required()
def unfollow():
    user = get_current_user()
    following_id = request.args.get("following_id", type=int)
    if not following_id:
        return jsonify({"error": "missing_following_id"}), 400

    f = Follower.query.filter_by(follower_id=user.id, following_id=following_id).first()
    if not f:
        return jsonify({"error": "not_found"}), 404
    db.session.delete(f)
    db.session.commit()
    return "", 204