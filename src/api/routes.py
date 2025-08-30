"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy import func
from api.models import db, User, Story, Chapter, Comment, Follower, UserRole, StoryStatus, ChapterStatus, StoryView
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

def get_current_user():
    uid = get_jwt_identity()
    if uid is None:
        return None
    try:
        uid = int(uid)
    except(TypeError, ValueError):
        pass
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

    new_user = User(email=email, password=pwd_hash, display_name=display_name)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.serialize()), 201

@api.route('/auth/login', methods=['POST'])
def login(): 
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    if not email or not password: 
        return jsonify({"error": "missing_fields"}), 400 
    
    new_user = User.query.filter_by(email=email).first()
    if not new_user or new_user.password != password: 
        return jsonify({"error": "invalid_credentials"}), 401

    return jsonify({
        "access_token": create_access_token(identity=str(new_user.id)),
        "refresh_token": create_refresh_token(identity=str(new_user.id)),
        "user": new_user.serialize()
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
        return jsonify({"error": "title_required"}), 400
    
    new_story = Story(author_id=user.id, title=title, synopsis=synopsis)
    db.session.add(new_story)
    db.session.commit()
    return jsonify(new_story.serialize()), 201

@api.route('/stories', methods=['GET'])
def list_stories():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 10)), 1), 50)
    list_order = Story.query.order_by(Story.published_at.desc().nulls_last(), Story.id.desc())
    pag = list_order.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [s.serialize() for s in pag.items],
        "page": pag.page, "per_page": pag.per_page, "total": pag.total
    })

@api.route('/stories/<int:story_id>', methods=['GET'])
def get_story(story_id: int):
    stories = db.session.get(Story, story_id)
    if not stories: return jsonify({"error": "not_found"}), 404
    return jsonify(stories.serialize())

#We use patch in order to partially update the record, PUT completly overrides the record.
@api.route('/stories/<int:story_id>', methods=['PATCH'])
@jwt_required()
def update_story(story_id:int):
    user = get_current_user()
    stories_update = db.session.get(Story, story_id)
    if not stories_update: return jsonify({"error": "not_found"}), 404 
    if stories_update.author_id != user.id: 
        return jsonify({"error": "forbidden"}), 403 

    data = request.get_json() or {}
    for field in ("title", "synopsis"):
        if field in data and data[field] is not None: 
            setattr(stories_update, field, data[field])

    if "status" in data and data["status"] is not None:
        try:
            new_status = StoryStatus(data["status"])
        except ValueError:
            return jsonify({"error": "invalid_status"}), 422

        old_status = stories_update.status
        stories_update.status = new_status

        if old_status != StoryStatus.PUBLISHED and new_status == StoryStatus.PUBLISHED:
            stories_update.published_at = func.now()
        elif new_status != StoryStatus.PUBLISHED:
            stories_update.published_at = None

        if new_status == StoryStatus.DELETED:
            stories_update.deleted_at = func.now()
        else:
            stories_update.deleted_at = None
    
    db.session.commit()
    return jsonify(stories_update.serialize()), 200

@api.route('/stories/<int:story_id>/chapters', methods=['POST'])
@jwt_required()
def create_chapter(story_id:int):
    user = get_current_user()
    stories = db.session.get(Story, story_id)
    if not stories: return jsonify({"error": "not_found"}), 404 
    if stories.author_id != user.id: 
        return jsonify({"error": "forbidden"}), 403 
    
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    number = data.get("number")
    content = (data.get("content") or "").strip()
    status = data.get("status")
    if not title or not number or not content: 
        return jsonify({"error": "missing_fields"}), 400
    
    if status is None: 
        new_status= ChapterStatus.DRAFT
    else:
        try:
            new_status = ChapterStatus(status)
        except ValueError: 
            return jsonify({"error": "invalid_status"}), 422
        
    new_chapter = Chapter(story_id=story_id, title=title, number=int(number), content=content, status=new_status)
    db.session.add(new_chapter)
    db.session.commit()
    return jsonify(new_chapter.serialize()), 201

@api.route('/stories/<int:story_id>/chapters/<int:chapter_id>', methods=['DELETE'])
@jwt_required()
def delete_chapter(story_id: int, chapter_id: int):
    user = get_current_user()
    chapter_delete = Chapter.query.filter_by(id=chapter_id, story_id=story_id).first()
    if not chapter_delete or chapter_delete.deleted_at is not None:
        return jsonify({"error": "not_found"}), 404
    stories = db.session.get(Story, story_id)
    if stories.author_id != user.id and user.user_role != UserRole.ADMIN:
        return jsonify({"error": "forbidden"}), 403

    hard = (request.args.get("hard", "false").lower() == "true")

    if hard:
        db.session.delete(chapter_delete)
    else:
        chapter_delete.deleted_at = func.now()
        chapter_delete.status = ChapterStatus.DELETED

    db.session.commit()
    return "", 204

@api.route("/stories/<int:story_id>/chapters", methods=["GET"])
def list_chapters(story_id: int):
    items = Chapter.query.filter_by(story_id=story_id).order_by(Chapter.number.asc()).all()
    return jsonify([c.serialize() for c in items])

@api.route("/user/me/recent-stories", methods=["GET"])
@jwt_required()
def recent_stories():
    user = get_current_user()
    viewed = (StoryView.query.filter_by(user_id=user.id).order_by(StoryView.last_viewed_at.desc()).limit(5))
    return jsonify([sv.serialize() for sv in viewed.all()]), 200

@api.route("/stories/<int:story_id>/view", methods=["POST"])
@jwt_required()
def mark_view(story_id: int):
    user = get_current_user()
    viewed = db.session.get(Story, story_id)
    if not viewed:
        return jsonify({"error": "not_found"}), 404

    sv = StoryView.query.filter_by(user_id=user.id, story_id=story_id).first()
    if sv:
        sv.last_viewed_at = func.now()
        sv.view_count = sv.view_count + 1
    else:
        sv = StoryView(user_id=user.id, story_id=story_id)
        db.session.add(sv)

    db.session.commit()
    return jsonify(sv.serialize()), 200

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

    new_comment = Comment(user_id=user.id, story_id=int(story_id), text=text)
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(new_comment.serialize()), 201


@api.route("/comments", methods=["GET"])
def list_comments():
    story_id = request.args.get("story_id", type=int)
    comment_list = Comment.query
    if story_id:
        comment_list = comment_list.filter_by(story_id=story_id)
    comment_list = comment_list.order_by(Comment.created_at.desc())
    return jsonify([c.serialize() for c in comment_list.limit(100).all()])


@api.route("/follows", methods=["GET"])
def list_follows():
    following_id = request.args.get("following_id", type=int)
    follower_id = request.args.get("follower_id", type=int)

    q = Follower.query
    if following_id is not None:
        q = q.filter_by(following_id=following_id)
    if follower_id is not None:
        q = q.filter_by(follower_id=follower_id)

    q = q.order_by(Follower.id.desc()) 
    items = q.limit(100).all()

    return jsonify([f.serialize() for f in items]), 200

@api.route("/follows", methods=["POST"])
@jwt_required()
def follow():
    user = get_current_user()
    data = request.get_json() or {}
    following_id = data.get("following_id")
    if not following_id or int(following_id) == user.id:
        return jsonify({"error": "invalid_follow"}), 400

    new_follower = Follower(follower_id=user.id, following_id=int(following_id))
    db.session.add(new_follower)
    db.session.commit()
    return jsonify(new_follower.serialize()), 201

@api.route("/follows", methods=["DELETE"])
@jwt_required()
def unfollow():
    user = get_current_user()
    following_id = request.args.get("following_id", type=int)
    if not following_id:
        return jsonify({"error": "missing_following_id"}), 400

    unfollow = Follower.query.filter_by(follower_id=user.id, following_id=following_id).first()
    if not unfollow:
        return jsonify({"error": "not_found"}), 404
    db.session.delete(unfollow)
    db.session.commit()
    return "", 204