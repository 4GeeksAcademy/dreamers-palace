import avatarpfp from "../assets/img/avatar2.png";

export const WriterFollowing = () => {
    return (<div>
    <div className="p-5 bg-body-tertiary">
            <div className="container-fluid d-flex flex-column align-items-center py-5">
                <div>
                    <img
                        src={avatarpfp}
                        className="profile-page rounded-circle"
                        alt="..."
                        style={{width: "120px", height: "120px", objectFit: "cover"}}
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
        <div className="container my-4 p-3 bg-white rounded shadow">
            <h1 className="mb-4">Following</h1>
            <div className="row g-4">
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 text-center">
                        <img
                            src={avatarpfp}
                            className="rounded-circle mx-auto d-block mt-3"
                            style={{width: "80px"}}
                            alt="..."
                        />
                        <div className="card-body d-flex flex-column align-items-center">
                            <h5 className="card-title">Writer Name</h5>
                            <p className="card-text text-secondary">@username</p>
                            <a href="#" className="btn btn-primary">Following</a>
                        </div>
                        <div className="card-footer d-flex gap-3">
                            <p>#Works</p>
                            <p>#Followers</p>
                            <p>#Following</p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 text-center">
                        <img
                            src={avatarpfp}
                            className="rounded-circle mx-auto d-block mt-3"
                            style={{width: "80px"}}
                            alt="..."
                        />
                        <div className="card-body d-flex flex-column align-items-center">
                            <h5 className="card-title">Writer Name</h5>
                            <p className="card-text text-secondary">@username</p>
                            <a href="#" className="btn btn-primary">Following</a>
                        </div>
                        <div className="card-footer d-flex gap-3">
                            <p>#Works</p>
                            <p>#Followers</p>
                            <p>#Following</p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 text-center">
                        <img
                            src={avatarpfp}
                            className="rounded-circle mx-auto d-block mt-3"
                            style={{width: "80px"}}
                            alt="..."
                        />
                        <div className="card-body d-flex flex-column align-items-center">
                            <h5 className="card-title">Writer Name</h5>
                            <p className="card-text text-secondary">@username</p>
                            <a href="#" className="btn btn-primary">Following</a>
                        </div>
                        <div className="card-footer d-flex gap-3">
                            <p>#Works</p>
                            <p>#Followers</p>
                            <p>#Following</p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 text-center">
                        <img
                            src={avatarpfp}
                            className="rounded-circle mx-auto d-block mt-3"
                            style={{width: "80px"}}
                            alt="..."
                        />
                        <div className="card-body d-flex flex-column align-items-center">
                            <h5 className="card-title">Writer Name</h5>
                            <p className="card-text text-secondary">@username</p>
                            <a href="#" className="btn btn-primary">Following</a>
                        </div>
                        <div className="card-footer d-flex gap-3">
                            <p>#Works</p>
                            <p>#Followers</p>
                            <p>#Following</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            </div>
    )
}