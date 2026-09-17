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

update the ui for app minting page 
add the connect functionality using the rainbow kit 
create the backend for the mint functionality 
cretae the smart contract 
depply the contrcat on the sepolia 






