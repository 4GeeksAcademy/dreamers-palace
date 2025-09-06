"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy import func, or_, and_
from api.models import (
    db, User, Story, Chapter, Comment, Follower,
    UserRole, StoryStatus, ChapterStatus, StoryView,
    Category, Tag
)
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, verify_jwt_in_request
import re

api = Blueprint('api', __name__)

CORS(api)

def get_current_user():
    uid = get_jwt_identity()
    if uid is None:
        return None
    try:
        uid = int(uid)
    except (TypeError, ValueError):
        pass
    return db.session.get(User, uid) if uid is not None else None

def get_current_user_optional():
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        return None
    return get_current_user()

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

@api.route('/user', methods=['GET'])
def get_user():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

@api.route('/user/me', methods=['GET'])
@jwt_required()
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "unauthorized"}), 401
    return jsonify(user.serialize()), 200

@api.route('/user/me', methods=['PATCH'])
@jwt_required()
def update_me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json() or {}

    if "display_name" in data and data["display_name"] is not None:
        new_dn = (data.get("display_name") or "").strip()
        if not new_dn:
            return jsonify({"error": "missing_display_name"}), 400
        if len(new_dn) > 80:
            return jsonify({"error": "display_name_too_long"}), 422
        exists = User.query.filter(and_(User.display_name == new_dn, User.id != user.id)).first()
        if exists:
            return jsonify({"error": "display_name_taken"}), 409
        user.display_name = new_dn

    if "bio" in data:
        bio = data.get("bio")
        if bio is not None:
            bio = str(bio).strip()
            if len(bio) > 1000:
                return jsonify({"error": "bio_too_long"}), 422
        user.bio = bio

    if "location" in data:
        loc = data.get("location")
        if loc is not None:
            loc = str(loc).strip()
            if len(loc) > 120:
                return jsonify({"error": "location_too_long"}), 422
        user.location = loc

    db.session.commit()
    return jsonify(user.serialize()), 200


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

@api.route('/categories', methods=['GET'])
def list_categories():
    items = Category.query.order_by(Category.name.asc()).all()
    return jsonify([c.serialize() for c in items]), 200

@api.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    user = get_current_user()
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    slug = (data.get("slug") or "").strip().lower()

    if not name:
        return jsonify({"error": "missing_name"}), 400

    if not slug:
        slug = name.strip().lower().replace(" ", "-")
        slug = re.sub(r"[^a-z0-9-]+", "", slug)
        slug = re.sub(r"-{2,}", "-", slug).strip("-")

    if not slug:
        return jsonify({"error": "missing_slug"}), 400

    exists = Category.query.filter(or_(Category.name == name, Category.slug == slug)).first()
    if exists:
        return jsonify(exists.serialize()), 200

    cat = Category(name=name, slug=slug)
    db.session.add(cat)
    db.session.commit()
    return jsonify(cat.serialize()), 201

@api.route('/tags', methods=['GET'])
def list_tags():
    q = (request.args.get("q") or "").strip()
    tag_q = Tag.query
    if q:
        like = f"%{q}%"
        tag_q = tag_q.filter(or_(Tag.name.ilike(like), Tag.slug.ilike(like)))
    items = tag_q.order_by(Tag.name.asc()).limit(200).all()
    return jsonify([t.serialize() for t in items]), 200

@api.route('/tags', methods=['POST'])
@jwt_required()
def create_tag():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    slug = (data.get("slug") or "").strip().lower()

    if not name:
        return jsonify({"error": "missing_name"}), 400

    if not slug:
        slug = name.strip().lower().replace(" ", "-")
        slug = re.sub(r"[^a-z0-9-]+", "", slug)
        slug = re.sub(r"-{2,}", "-", slug).strip("-")

    if not slug:
        return jsonify({"error": "missing_slug"}), 400

    exists = Tag.query.filter(or_(Tag.name == name, Tag.slug == slug)).first()
    if exists:
        return jsonify(exists.serialize()), 200

    tag = Tag(name=name, slug=slug)
    db.session.add(tag)
    db.session.commit()
    return jsonify(tag.serialize()), 201

@api.route('/stories', methods=['POST'])
@jwt_required()
def create_story():
    user = get_current_user()
    if not user:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    synopsis = (data.get("synopsis") or "").strip()
    category_id = data.get("category_id")
    in_tags = data.get("tags") 

    if not title:
        return jsonify({"error": "title_required"}), 400

    new_story = Story(author_id=user.id, title=title, synopsis=synopsis)

    if category_id is not None:
        try:
            new_story.category_id = int(category_id)
        except (TypeError, ValueError):
            return jsonify({"error": "invalid_category_id"}), 422

    if isinstance(in_tags, list):
        tags_objs = []
        for raw in in_tags:
            name = str(raw or "").strip()
            if not name:
                continue
            s = name.strip().lower().replace(" ", "-")
            s = re.sub(r"[^a-z0-9-]+", "", s)
            s = re.sub(r"-{2,}", "-", s).strip("-")
            existing = Tag.query.filter(or_(Tag.slug == s, Tag.name.ilike(name))).first()
            if existing:
                tags_objs.append(existing)
            else:
                t = Tag(name=name, slug=s)
                db.session.add(t)
                db.session.flush()
                tags_objs.append(t)
        new_story.tags = tags_objs

    db.session.add(new_story)
    db.session.commit()
    return jsonify(new_story.serialize()), 201

@api.route('/stories', methods=['GET'])
def list_stories():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 10)), 1), 50)

    author_id = request.args.get("author_id", type=int)
    category_id = request.args.get("category_id", type=int)
    category_slug = (request.args.get("category_slug") or "").strip().lower()
    tag_slug = (request.args.get("tag") or "").strip().lower()

    q = Story.query

    if author_id is not None:
        q = q.filter_by(author_id=author_id)

    if category_id is not None:
        q = q.filter_by(category_id=category_id)

    if category_slug:
        q = q.join(Story.category).filter(Category.slug == category_slug)

    if tag_slug:
        q = q.join(Story.tags).filter(Tag.slug == tag_slug)

    list_order = q.order_by(Story.published_at.desc().nulls_last(), Story.id.desc())
    pag = list_order.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [s.serialize() for s in pag.items],
        "page": pag.page, "per_page": pag.per_page, "total": pag.total
    })

@api.route('/stories/<int:story_id>', methods=['GET'])
def get_story(story_id: int):
    stories = db.session.get(Story, story_id)
    if not stories:
        return jsonify({"error": "not_found"}), 404
    return jsonify(stories.serialize())

# We use patch in order to partially update the record, PUT completely overrides the record.
@api.route('/stories/<int:story_id>', methods=['PATCH'])
@jwt_required()
def update_story(story_id: int):
    user = get_current_user()
    stories_update = db.session.get(Story, story_id)
    if not stories_update:
        return jsonify({"error": "not_found"}), 404
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

    if "category_id" in data:
        cid = data["category_id"]
        if cid is None:
            stories_update.category_id = None
        else:
            try:
                stories_update.category_id = int(cid)
            except (TypeError, ValueError):
                return jsonify({"error": "invalid_category_id"}), 422

    if "tags" in data:
        in_tags = data.get("tags")
        if in_tags is None:
            stories_update.tags = []
        elif isinstance(in_tags, list):
            tags_objs = []
            for raw in in_tags:
                name = str(raw or "").strip()
                if not name:
                    continue
                s = name.strip().lower().replace(" ", "-")
                s = re.sub(r"[^a-z0-9-]+", "", s)
                s = re.sub(r"-{2,}", "-", s).strip("-")
                existing = Tag.query.filter(or_(Tag.slug == s, Tag.name.ilike(name))).first()
                if existing:
                    tags_objs.append(existing)
                else:
                    t = Tag(name=name, slug=s)
                    db.session.add(t)
                    db.session.flush()
                    tags_objs.append(t)
            stories_update.tags = tags_objs
        else:
            return jsonify({"error": "invalid_tags"}), 422

    db.session.commit()
    return jsonify(stories_update.serialize()), 200

@api.route('/stories/<int:story_id>/chapters', methods=['POST'])
@jwt_required()
def create_chapter(story_id: int):
    user = get_current_user()
    stories = db.session.get(Story, story_id)
    if not stories:
        return jsonify({"error": "not_found"}), 404
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
        new_status = ChapterStatus.DRAFT
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
    items = (Chapter.query
             .filter_by(story_id=story_id)
             .filter(Chapter.deleted_at.is_(None))
             .order_by(Chapter.number.asc())
             .all())
    return jsonify([c.serialize() for c in items])


@api.route("/user/me/recent-stories", methods=["GET"])
@jwt_required()
def recent_stories():
    user = get_current_user()
    viewed = (StoryView.query.filter_by(user_id=user.id).order_by(StoryView.last_viewed_at.desc()).limit(5))
    return jsonify([sv.serialize() for sv in viewed.all()]), 200

@api.route('/stories/<int:story_id>/chapters/<int:chapter_id>', methods=['GET'])
def get_chapter(story_id: int, chapter_id: int):
    c = Chapter.query.filter_by(id=chapter_id, story_id=story_id).first()
    if not c or c.deleted_at is not None:
        return jsonify({"error": "not_found"}), 404

    if c.status != ChapterStatus.PUBLISHED:
        user = get_current_user_optional()
        if not user or (user.id != c.story.author_id and user.user_role != UserRole.ADMIN):
            return jsonify({"error": "forbidden"}), 403

    return jsonify(c.serialize()), 200

@api.route('/stories/<int:story_id>/chapters/<int:chapter_id>', methods=['PATCH'])
@jwt_required()
def update_chapter(story_id: int, chapter_id: int):
    user = get_current_user()
    c = Chapter.query.filter_by(id=chapter_id, story_id=story_id).first()
    if not c or c.deleted_at is not None:
        return jsonify({"error": "not_found"}), 404
    if c.story.author_id != user.id and user.user_role != UserRole.ADMIN:
        return jsonify({"error": "forbidden"}), 403

    data = request.get_json() or {}

    if "title" in data and data["title"] is not None:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "missing_title"}), 400
        c.title = title

    if "number" in data and data["number"] is not None:
        try:
            n = int(data["number"])
            if n < 1:
                raise ValueError()
        except (TypeError, ValueError):
            return jsonify({"error": "invalid_number"}), 422
        c.number = n

    if "content" in data and data["content"] is not None:
        content = (data.get("content") or "").strip()
        if not content:
            return jsonify({"error": "missing_content"}), 400
        c.content = content

    if "status" in data and data["status"] is not None:
        try:
            new_status = ChapterStatus(data["status"])
        except ValueError:
            return jsonify({"error": "invalid_status"}), 422
        old_status = c.status
        c.status = new_status

        if old_status != ChapterStatus.PUBLISHED and new_status == ChapterStatus.PUBLISHED:
            c.published_at = func.now()
        elif new_status != ChapterStatus.PUBLISHED:
            c.published_at = None


    db.session.commit()
    return jsonify(c.serialize()), 200

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

@api.route('/stories/<int:story_id>/chapters/<int:chapter_id>/comments', methods=['GET'])
def list_chapter_comments(story_id: int, chapter_id: int):
    items = (Comment.query
             .filter_by(story_id=story_id, chapter_id=chapter_id)
             .order_by(Comment.created_at.desc())
             .limit(100)
             .all())
    return jsonify([c.serialize() for c in items]), 200


@api.route('/stories/<int:story_id>/chapters/<int:chapter_id>/comments', methods=['POST'])
@jwt_required()
def create_chapter_comment(story_id: int, chapter_id: int):
    user = get_current_user()
    ch = Chapter.query.filter_by(id=chapter_id, story_id=story_id).first()
    if not ch or ch.deleted_at is not None:
        return jsonify({"error": "not_found"}), 404

    data = request.get_json() or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "missing_fields"}), 400
    if len(text) > 280:
        return jsonify({"error": "too_long"}), 400

    new_comment = Comment(
        user_id=user.id,
        story_id=story_id,
        chapter_id=chapter_id, 
        text=text
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(new_comment.serialize()), 201

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