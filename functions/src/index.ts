import * as functions from "firebase-functions";
import * as faker from "faker";
import * as twilio from "twilio";
const AccessToken: any = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const token = functions.https.onRequest((request, response) => {
  const identity = faker.name.findName();

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const accessToken = new AccessToken(
    functions.config().twilio.sid,
    functions.config().twilio.key,
    functions.config().twilio.secret
  );

  // Assign the generated identity to the token
  accessToken.identity = identity;

  const grant = new VideoGrant();
  // Grant token access to the Video API features
  accessToken.addGrant(grant);

  // cors headers
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST");
  response.set("Access-Control-Allow-Headers", "Content-Type");

  // Serialize the token to a JWT string and include it in a JSON response
  response.send({
    identity: identity,
    token: accessToken.toJwt()
  });
});
