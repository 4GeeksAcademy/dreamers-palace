import { Link } from "react-router-dom";
import examplecover from "../assets/img/dragon_cover.jpg"
import pfp from "../assets/img/avatar2.png"

export const WriterProfile = () => {
    return (<>
        <div className="p-5 bg-body-tertiary">
            <div className="container-fluid d-flex flex-column align-items-center py-5">
                <div>
                    <img
                        src={pfp}
                        className="profile-page rounded-circle"
                        alt="..."
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                </div>
                <div>
                    <h1 className="mt-3">Caesar</h1>
                </div>
                <div className="d-flex">
                    <p className="text-secondary me-2">#Stories</p>
                    <p className="text-secondary">#Followers</p>
                </div>
            </div>
        </div>
        <div className="container-fluid d-flex gap-3 bg-white py-2">
            <div>
                <button className="btn btn-primary" type="button">About</button>
            </div>
            <div>
                <button className="btn btn-primary">Following</button>
            </div>
            <div className="ms-auto">
                <button className="btn btn-primary">Edit Profile</button>
            </div>
        </div>
        <div className="d-flex gap-4">
            <div className="bg-white my-4 p-3 rounded shadow">
                <p>Description</p>
                <p>Location</p>
                <p>Joined at</p>
                <hr className="my-3" />
                <h4>Share Profile</h4>
                <div className="d-flex gap-3">
                    <i className="fa-brands fa-twitter" style={{ fontSize: "30px" }}></i>
                    <i className="fa-brands fa-facebook" style={{ fontSize: "30px" }}></i>
                    <i className="fa-brands fa-instagram" style={{ fontSize: "30px" }}></i>
                    <i className="fa-solid fa-envelope" style={{ fontSize: "30px" }}></i>
                </div>
            </div>

            <div className="bg-white my-4 p-3 rounded shadow mx-auto" style={{ maxWidth: "1200px" }}>
                <h1 className="mb-4">Stories</h1>

                <div className="d-flex flex-wrap gap-4">
                    <div className="d-flex bg-light rounded shadow-sm p-2" style={{ width: "350px" }}>
                        <div style={{ flex: "0 0 120px" }}>
                            <img
                                src={examplecover}
                                className="img-fluid rounded"
                                alt="cover"
                            />
                        </div>
                        <div className="ps-2">
                            <h5 className="card-title mb-1">Dragon Story</h5>
                            <p className="card-text small">Sinopsis 150 - 200 characters</p>
                            <p className="mb-1 small">#Comments</p>
                            <p className="mb-1 small">#Views</p>
                            <small className="text-body-secondary d-block mb-1">Last updated 3 mins ago</small>
                            <a href="#" className="me-2">Fantasy</a>
                            <a href="#">Medieval</a>
                        </div>
                    </div>

                    <div className="d-flex bg-light rounded shadow-sm p-2" style={{ width: "350px" }}>
                        <div style={{ flex: "0 0 120px" }}>
                            <img
                                src={examplecover}
                                className="img-fluid rounded"
                                alt="cover"
                            />
                        </div>
                        <div className="ps-2">
                            <h5 className="card-title mb-1">Dragon Story</h5>
                            <p className="card-text small">Sinopsis 150 - 200 characters</p>
                            <p className="mb-1 small">#Comments</p>
                            <p className="mb-1 small">#Views</p>
                            <small className="text-body-secondary d-block mb-1">Last updated 3 mins ago</small>
                            <a href="#" className="me-2">Fantasy</a>
                            <a href="#">Medieval</a>
                        </div>
                    </div>
                    <div className="d-flex bg-light rounded shadow-sm p-2" style={{ width: "350px" }}>
                        <div style={{ flex: "0 0 120px" }}>
                            <img
                                src={examplecover}
                                className="img-fluid rounded"
                                alt="cover"
                            />
                        </div>
                        <div className="ps-2">
                            <h5 className="card-title mb-1">Dragon Story</h5>
                            <p className="card-text small">Sinopsis 150 - 200 characters</p>
                            <p className="mb-1 small">#Comments</p>
                            <p className="mb-1 small">#Views</p>
                            <small className="text-body-secondary d-block mb-1">Last updated 3 mins ago</small>
                            <a href="#" className="me-2">Fantasy</a>
                            <a href="#">Medieval</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}