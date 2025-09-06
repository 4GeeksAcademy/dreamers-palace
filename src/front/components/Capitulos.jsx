import { Link } from "react-router-dom";

export const Capitulos = () => {
    return (<>
        <div className="content d-flex justify-content-center">


            <main>
                <header>
                    <h1>📖 Índice de Capítulos</h1>
                </header>

                <section className="chapters">
                    <article className="chapter-card text-center">
                        <h2>Capítulo 1</h2>
                        <p>El inicio de la aventura</p>
                        <div className="d-grid gap-2 col-6 mx-auto">

                            <button className="btn btn-primary" type="button">Button</button>
                        </div>
                    </article>

                    <article className="chapter-card mx-auto text-center">
                        <h2>Capítulo 2</h2>
                        <p>Un encuentro inesperado</p>
                        <div className="d-grid gap-2 col-6 mx-auto">

                            <button className="btn btn-primary" type="button">Button</button>
                        </div>
                    </article>

                    <article className="chapter-card mx-auto text-center">
                        <h2>Capítulo 3</h2>
                        <p>Sombras en el horizonte</p>
                        <div className="d-grid gap-2 col-6 mx-auto">

                            <button className="btn btn-primary" type="button">Button</button>
                        </div>
                    </article>

                </section>
            </main>
        </div>

    </>
    )
}