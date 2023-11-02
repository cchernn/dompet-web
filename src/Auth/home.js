// Import the react JS packages
import {useEffect, useState} from "react";
// Define the Login function.
export const Home = () => {
    const [message, setMessage] = useState('');
    useEffect(() => {
      try {
        setMessage("Welcome");
      } catch (e) {
        console.log('not auth');
      }
    }, []);
    console.log("hello");
    return <div className="form-signin mt-5 text-center">
                <h3>Hi {message}</h3>
            </div>
}