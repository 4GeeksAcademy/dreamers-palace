import { Link } from "react-router-dom";

export const welcomePage = () => {
    return (<>

        <div className="content d-flex justify-content-center my-4">
            <img src="Logotipo Color.png" alt="Dreamers Palace" height="140" />

        </div>
        <div className="content d-flex justify-content-center text-white">
            <h1>Hola, bienvenidos a Dreamers Palace Donde las historias cobran vida</h1>


        </div>

        <div className="row cols-6">
            <div className="container d-flex justify-content-center text-center ">

                <div className="row">
                    <div className="col-1 align-self-start">
                    </div>
                </div>
            </div>
        </div>

        <div className="container d-flex justify-content-center text-center ">
            <div className="row">
                <div className="">
                    <div className="col align-self-start">
                    </div>
                </div>
            </div>
        </div>

        <div className="container d-flex justify-content-center text-center ">
            <div className="row">
                <div className="">
                    <div className="col align-self-start">
                    </div>
                </div>
            </div>
        </div>
        <div className="d-flex">
            <div className="p-2 flex-fill">

                <img src="michi-escritor.png.jpeg" className="img-top rounded-circle" height="200" />
                <h2>Empezar a escribir</h2>
                <button type="button" className="btn btn-primary  btn-lg">Escribir</button>
            </div>
            <div className="p-2 flex-fill">
                <img src="michi-lector.png.jpeg" className="img-top rounded-circle" height="200" />
                <h2>Historias</h2>
                <button type="button" className="btn btn-primary  btn-lg">Comenzar a leer </button>
            </div>

            <div className="p-2 flex-fill">

                <img src="michi-avatar.jpeg.jpeg" className="img-top rounded-circle" height="200" />
                <h2>Login</h2>
                <button type="button" className="btn btn-primary  btn-lg">crea tu perfil</button>
            </div>
        </div>

        <div className="demo-content">
            <div className="container-fluid" style="padding-top: 20px;">
                <div className="row">
                    <div className="col-12">


                        <div className="jumbotron-glass">
                            <div className="book-decoration">📖</div>
                            <div className="container">
                                <div className="jumbotron-overlay text-center">
                                    <h1 className="hero-title">Dreamers Palace</h1>
                                    <p className="hero-subtitle">
                                        "Un reino donde los sueños cobran vida a través de las páginas.
                                        Descubre reseñas, recomendaciones y el fascinante mundo de la literatura
                                        que despierta tu imaginación."
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                                        <a href="#" className="btn btn-primary-glass btn-hero">Explorar Reseñas</a>
                                        <a href="#" className="btn btn-outline-glass btn-hero">Libros Recomendados</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="secondary-section p-5 text-center">
                            <h2 className="display-5 section-title mb-3">Explora Nuestro Universo Literario</h2>
                            <p className="fs-4 section-subtitle mb-5">
                                Sumérgete en historias que transforman perspectivas
                            </p>
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="card feature-card h-100 border-0">
                                        <div className="card-body p-4">
                                            <div className="feature-icon mb-3">
                                                <svg width="56" height="56" fill="currentColor" className="bi bi-book-half" viewBox="0 0 16 16">
                                                    <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                                                </svg>
                                            </div>
                                            <h5 className="card-title">Reseñas Detalladas</h5>
                                            <p className="card-text">Análisis profundos y honestos de las últimas novedades literarias y clásicos atemporales.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card feature-card h-100 border-0">
                                        <div className="card-body p-4">
                                            <div className="feature-icon mb-3">
                                                <svg width="56" height="56" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                </svg>
                                            </div>
                                            <h5 className="card-title">Recomendaciones</h5>
                                            <p className="card-text">Sugerencias personalizadas basadas en géneros, estados de ánimo y preferencias lectoras.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card feature-card h-100 border-0">
                                        <div className="card-body p-4">
                                            <div className="feature-icon mb-3">
                                                <svg width="56" height="56" fill="currentColor" className="bi bi-chat-heart" viewBox="0 0 16 16">
                                                    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v3.797l.5.5.5-.5V4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H7.707l-3.354 3.354a.5.5 0 0 1-.708-.708L6.293 12H2.5A1.5 1.5 0 0 1 1 10.5V4.5A1.5 1.5 0 0 1 2.5 3z" />
                                                    <path d="M8 5.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132Z" />
                                                </svg>
                                            </div>
                                            <h5 className="card-title">Comunidad Lectora</h5>
                                            <p className="card-text">Conecta con otros apasionados de la literatura y comparte tus experiencias de lectura.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-5">
                                <div className="col-12">
                                    <div className="quote-section p-4">
                                        <h4 className="section-title mb-3">📖 Cita del Día</h4>
                                        <blockquote className="blockquote text-center mb-0">
                                            <p className="mb-3" style="font-family: 'Crimson Text', serif; font-style: italic; font-size: 1.2rem; color: #000000;">
                                                "Los libros son espejos: solo se ve en ellos lo que uno ya lleva dentro."
                                            </p>
                                            <footer className="blockquote-footer" style="color: #333333;">
                                                Carlos Ruiz Zafón
                                            </footer>
                                        </blockquote>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
        </>

        )
}
