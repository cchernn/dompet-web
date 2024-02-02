import React, { Component } from "react"
import { FaRegFaceLaugh, FaRegFaceDizzy, FaRegFaceFrownOpen, FaRegFaceAngry, FaRegFaceGrimace, FaRegFaceMeh, FaRegFaceGrinTongueSquint, FaRegFaceRollingEyes } from "react-icons/fa6";
import API from "../Services/API"

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            profileData: {
                username: "",
                email: "",
                first_name: "",
                last_name: ""
            },
            currentImage: <FaRegFaceLaugh />,
            images: [
                <FaRegFaceLaugh />,
                <FaRegFaceDizzy />,
                <FaRegFaceFrownOpen />,
                <FaRegFaceAngry />,
                <FaRegFaceGrimace />,
                <FaRegFaceMeh />,
                <FaRegFaceGrinTongueSquint />,
                <FaRegFaceRollingEyes />,
            ]
        }
    }
    
    componentDidMount() {
        this.getProfile()
        this.intervalId = setInterval(() => {
            const images = this.state.images;
            this.setState({
                currentImage: images[Math.floor(Math.random() * images.length)],
            });
        }, 2000);
    }

    getProfile = async () => {
        await API.request(
            'get',
            '/me',
            {}
        )
        .then((res) => this.setState({ profileData: res.data }))
        .catch((err) => console.log(err))
    }


    render() {
        const {username, email, first_name, last_name, is_superuser, group_names} = this.state.profileData

        return (
            <section id="profile-box" className="container">
                <div className="wrapper-profile">
                    <div className="profile-image">{this.state.currentImage}</div>
                    <div className="profile-details">
                        <ul>
                            <li>
                                <div className="profile-detail">Username:</div>
                                <div className="profile-detail">{username}</div>
                            </li>
                            <li>
                                <div className="profile-detail">Email:</div>
                                <div className="profile-detail">{email}</div>
                            </li>
                            <li>
                                <div className="profile-detail">First Name:</div>
                                <div className="profile-detail">{first_name}</div>
                            </li>
                            <li>
                                <div className="profile-detail">Last Name:</div>
                                <div className="profile-detail">{last_name}</div>
                            </li>
                            <li>
                                <div className="profile-detail">Modules:</div>
                                <div className="profile-detail">{is_superuser ? "All" : group_names}</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        )
    }
}

export default Profile