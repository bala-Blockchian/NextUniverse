on clicking the mint button 

1. post for the mint

call the post api with the necessary parameter like the long llat , the place where the plot belongs to and the time and the date of minting and other details about the plot

first generate the metadate 
host the metadate to the pinata

get the token uri 
and call the mint funvtion on the smart contract with the token uri and rhe receiver address which is connected on the call attack the payment of 0.001 ether 

wait for the tx conformation 
get the tx hash 


2. get all the plots that is been owned 

render on the map 
the plot should be disabled and it shuld displace the recver address who ownes the plot 

3. getter to get the purchased nfts for a user 
parameter user address 
return all the details about the plot owner by the user 



lets design the tabele for this 

user table 

receiver address 
created at 
list of plots 


plots 
lat 
long 
place 
available status 

enum available 
minted 
available 
processing - to lock the db and process of minting to avoid the collision 


blockchain stats 
user id
plot id 
minted at 
tx hash 
token uri 
token id 






things to be done

update the ui for app minting page - done 
add the connect functionality using the rainbow kit - done
create the backend for the mint functionality 
cretae the smart contract 
depply the contrcat on the sepolia 




create the nft based smart contract
init the foundry project

create a simple nft contract for this name is nextuniverse - done 


deploy to the sepolia testnet - done 



init a express projext folder name backend 
insatll the express lib 
create the post request for the mint button 






that takes the follofing parameter :

{
    id: 'NX-0001',
    name: 'Marina Reach',
    place: 'Marina Beach, Chennai',
    sector: 'Sector 7',
    lat: 13.05,
    lng: 80.2824,
    priceBdx: 2400,
    priceUsd: 120,
    areaSqm: 250,
    size: '16m × 16m',
    zoom: 16,
  }


//generate the metedata 
//upload the file to the pinata 


API Key: 0b4e77e444fcc32c3262
API Secret: 77844af44e7ad741046caea76268ba7d08a021d3a8b52110f669f13d2361340b
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1MDhlNGZmMS05NWU0LTQwZGYtOWI3MS05N2I0NWIyZTNjZDUiLCJlbWFpbCI6ImJhbGFtdXJ1Z2FubmFnYXJhamFuLnZtQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIwYjRlNzdlNDQ0ZmNjMzJjMzI2MiIsInNjb3BlZEtleVNlY3JldCI6Ijc3ODQ0YWY0NGU3YWQ3NDEwNDZjYWVhNzYyNjhiYTdkMDhhMDIxZDNhOGI1MjExMGY2NjlmMTNkMjM2MTM0MGIiLCJleHAiOjE4MjEyMjAwNjV9.QVG2RcHy0qfiMe48E7xH0WOfA2jMMp8IYCGYNV3dZyY

//get the token uri 

//make a tranfer of 0.00001 sepolia ether 
// if success then proceed to this step 
//call the mint function 
network paramters :

 --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key \

//contract address : 0x6da4fA6491162ffcf194aE04a210bbb4dd9a38BD
function mintNft(string memory tokenUri) public onlyOwner {
        s_tokenIdToUri[s_tokenCounter] = tokenUri;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }
//



thing to be done :


remove the metamask connect from the code base 
update the price of every plot to be 200 bdx 
when the user clicks on the mint the plot button 

dont make a external call to the post api or remive the exsiting login when clicking on the mint button 
as of now dont make any external api calls 

there should be a popup with two progressive bars
 one showing the beldex receiver address with the copy button and qr code 

  use this code 

 export async function generateBeldexQrDataUrl(address, amount, description = "") {
  const uri = buildBeldexUri(address, amount, description);
  return QRCode.toDataURL(uri, { margin: 1, width: 260 });
}

 and two more input bocx for the tx hash of the payment and the eth wallet addresss with the description as where the nft will be minted 

 once the user have pasted the tx hash and the eth dattess check the formate 
 and do this verification 

 use this logic for the verification code :

 export async function verifyTxTimestamp(txHash, maxDiffSeconds = 500) {
  try {
    const explorerUrl = `https://explorer.beldex.io/tx/${txHash}`;
    const response = await fetch(explorerUrl);

    if (!response.ok) {
      return { ok: false, reason: "not-found" };
    }

    const htmlText = await response.text();
    const doc = new DOMParser().parseFromString(htmlText, "text/html");

    const spanElement = doc.querySelector('span[title^="Unix timestamp:"]');
    if (!spanElement) {
      return { ok: false, reason: "not-found" };
    }

    const titleAttr = spanElement.getAttribute("title");
    const txUnixTime = parseInt(titleAttr.replace("Unix timestamp:", "").trim(), 10);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentUnixTime - txUnixTime);

    return { ok: timeDiff <= maxDiffSeconds, reason: timeDiff <= maxDiffSeconds ? null : "too-old" };
  } catch (err) {
    // Most likely a CORS block or offline network — not proof the hash is invalid.
    return { ok: false, reason: "network" };
  }
}


 in the second progressive bar tab :
 

