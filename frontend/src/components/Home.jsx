import { Link } from "react-router-dom"

const Home = () => {
  return(
    <>
    <p>home</p>
    <li>
            <Link to="/chat">Chat</Link>
          </li>
          </>
  )
}

export default Home