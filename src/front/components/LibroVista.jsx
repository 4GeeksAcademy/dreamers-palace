import { Link } from "react-router-dom";

export const LibroVista = () => {
    return (<>

         <div className="container">

      
        <div className="book-header">
            <img src="Recurso 4ldpi.png" alt="Portada Dreamer's Palace" className="book-cover"/>

            <div className="book my-3 text-dark">
                <h1>Dreamer's Palace</h1>
                <p className="meta">
                    <i className="fa-solid fa-eye"> Reads:<strong>2</strong></i>


                    <i className="fa-solid fa-list">Parts: <strong>2</strong></i>
                </p>    
                <div className="d-grid gap-2">
                    <button className="btn btn-primary" type="button">📖 Start reading</button>
                </div>

            </div>
        </div>

           
            <div className="author">
                <img src="michi-avatar.jpeg.jpeg" alt="Avatar" className="avatar"/>
                <div>
                    <p><strong>Michid3334</strong></p>
                    <span className="tag ongoing">Ongoing</span>
                    <span className="tag mature">Mature</span>
                    <span className="tag new">2 new parts</span>
                </div>
            </div>

        
            <p className="description">Test 1st Story</p>
            <p className="rights">© All Rights Reserved</p>

          
            <div className="tags">
                <span>#cesare</span>
                <span>#emotional</span>
                <span>#palaces</span>
            </div>

         
            <div className="toc">
                <h3>Table of contents</h3>
                <ul>
                    <li><span className="dot green"></span> Chapter 1, Part 1 <span className="time">3 minutes ago</span></li>
                    <li><span className="dot red"></span> United chapter 2, part 2 <span className="time">1 minute ago</span>
                    </li>
                </ul>
            </div>

        </div>
    </>

    )
}
    
        