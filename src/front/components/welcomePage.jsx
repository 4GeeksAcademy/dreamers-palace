import { Link } from "react-router-dom";

export const welcomePage = () => {
    return (<>
        <div className="content d-flex justify-content-center align-items-center text-center">
            <img src="Logotipo Color.png" alt="Dreamers Palace" height="140" className="mt-2 " />

        </div>


        <div className="row">
            <div className="col-sm-6 mb-3 mb-sm-0">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Special title treatment</h5>
                        <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                        <a href="#" className="btn btn-primary">Go somewhere</a>
                    </div>
                </div>
            </div>
            <div className="col-sm-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Special title treatment</h5>
                        <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                        <a href="#" className="btn btn-primary">Go somewhere</a>
                    </div>
                </div>
            </div>
        </div>

        <p className="hero-description d-flex justify-content-center align-items-center text-center text-white">
            Una comunidad minimalista y elegante para escritores que buscan inspiración,
            conexión y herramientas profesionales para dar vida a sus historias más extraordinarias.
        </p>

        <div className="content d-flex justify-content-center">
            <div id="carouselExample" className="carousel slide">
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <img src="https://cdn.pixabay.com/photo/2025/08/03/15/10/cat-9752539_1280.jpg" className="d-block w-100"
                            alt="" height="200" />

                        <p className="hero-subtitle">Donde las historias cobran vida</p> <div className="hero-buttons">
                            <button className="btn btn-primary" onclick="enterPalace()">Comenzar a Escribir</button>

                        </div>
                        <div className="carousel-item">
                            <img src="https://cdn.pixabay.com/photo/2024/03/19/19/08/book-8643904_1280.jpg"/>
                            className="d-block w-100" alt="" height="200"
                            <p className="hero-subtitle">Entra en la mente de cada escritor</p> <div className="hero-buttons">
                                <button className="btn btn-secondary" onclick="scrollToFeatures()">Conocer Más</button>


                            </div>
                            <div className="carousel-item">
                                <img src="https://cdn.pixabay.com/photo/2022/01/16/19/01/candle-6942931_1280.jpg"/>
                                    className="d-block w-100" alt="" height="200"

                                    <p className="hero-subtitle">haz que tus ideas se trasformen en historias</p> <div className="hero-buttons">
                                        <button className="btn btn-secondary" onclick="scrollToFeatures()">Conocer Más</button>


                                    </div>
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                    <p className="hero-subtitle">Donde las historias cobran vida</p>
        <div className="hero-buttons">
                        <button className="btn btn-primary" onclick="enterPalace()">Comenzar a Escribir</button>
                        <button className="btn btn-secondary" onclick="scrollToFeatures()">Conocer Más</button>
                    </div>

                </div>
            </div>
         </div>
        </>

    )
}
