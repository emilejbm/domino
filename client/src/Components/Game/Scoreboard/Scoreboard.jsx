// import styled from "styled-components";
// import Avatar from "../../Shared/Avatar/Avatar";
// import { Grid2, Typography } from "@mui/material";
// import Button from "../../Shared/Button/Button";

// const Root = styled.div`
//   position: fixed;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   background: rgba(0, 0, 0, 0.8);
//   color: white;
//   padding: 40px 70px;
//   border-radius: 12px;
//   font-size: 2rem;
//   .row {
//     &.me {
//       color: yellow;

//       animation: pulse 1s infinite;
//     }

//     display: flex;
//     align-items: center;
//     gap: 24px;

//     .order {
//       width: 50px;
//       font-size: 1.5rem;
//     }

//     .img {
//       width: 50px;
//     }
//   }

//   @keyframes pulse {
//     50% {
//       transform: scale(1.05);
//     }
//   }
// `;

// export default function Scoreboard({ players }) {
//   return (
//     <Root>
//       <Typography variant="h2" textAlign="center" fontWeight={600} mb={6}>
//         Game Finished!!
//       </Typography>
//       {players.map((p, idx) => (
//         <div className={`row "me"}`} key={idx}>
//           <div className="order">{idx + 1}</div>
//           <div className="img">
//             <Avatar seed={`${p.name}`} />{" "}
//           </div>
//           <div className="name">{p.name}</div>
//         </div>)
//       )}
      
//       <Grid2 container justifyContent="center" mt={6}>
//           <Button onClick={() => {}}>Play Again</Button>
//       </Grid2>
//       </Root>
//   );
// }
