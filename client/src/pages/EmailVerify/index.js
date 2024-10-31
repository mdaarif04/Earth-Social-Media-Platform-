// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux"; // Importing useDispatch and useSelector
// import { emailVerify } from "../../redux/actions/authAction"; // Import your emailVerify action
// import success from "../../images/success.png";
// // import styles from "./styles.module.css";
// import { Fragment } from "react";

// const EmailVerify = () => {
//   const [validUrl, setValidUrl] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");

//   const param = useParams();
//   const dispatch = useDispatch(); // Initialize useDispatch

//   useEffect(() => {
//     const verifyEmail = async () => {
//       try {
//         await dispatch(emailVerify(param.id, param.token)); // Dispatch the email verification action
//         setValidUrl(true); // Set valid URL if dispatch was successful
//       } catch (error) {
//         setValidUrl(false); // Set invalid URL if there was an error
//         setErrorMessage(error.message || "Verification failed.");
//       } finally {
//         setLoading(false); // Stop loading
//       }
//     };
//     verifyEmail();
//   }, [dispatch, param]);

//   return (
//     <Fragment>
//       {loading ? (
//         <h1>Loading...</h1>
//       ) : validUrl ? (
//         <div className="container">
//           <img src={success} alt="success_img" className="success_img" />
//           <h1>Email verified successfully</h1>
//           <Link to="/login">
//             <button className="green_btn">Login</button>
//           </Link>
//         </div>
//       ) : (
//         <div className="error_container">
//           <h1>{errorMessage || "404 Not Found"}</h1>
//         </div>
//       )}
//     </Fragment>
//   );
// };

// export default EmailVerify;
