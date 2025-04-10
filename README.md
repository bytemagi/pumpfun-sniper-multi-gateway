# pumpfun-sniper-multi-gateway ( Open Source )

[Contact via Telegram](https://t.me/bytemagi)

## Feature

- Snipe Buy token which is launched on pumpfun
- Jito Confirm & Next Block Support
- Helius geyser Rpc Support

## Performance Aspect

- Geyser 150ms Latency ( available to decreased upto server situation )
- Build Transaction 3 - 4 ms
- Submit via NextBlock or Jito & RPC Confirm ( 120ms )

## Is it ultimate tool ?
Ofc not.

# How to become first Buyer ?
- To use reliable RPC
  Ofc , there are so many rpc subscribe providers like yellowstone grpc , vibestation grpc , helius enhance websocket , Jito Shred stream
- Build Transaction
  Actually , transaction building time doesn't affect to sniping time but we can optimize it
  I think rust is effective way in this case
- To proceed Smart Contract CPI
  Why is it needed ?
  In swap , you will see get pool rpc call.
  Ofc , it doesnt take much time but it affects sniping time
  Once we use smart contract , we can skip get pool reserve token balance and pool info
- Build Racing Transaction
  What is racing transcation ?
  
  ![image](https://github.com/user-attachments/assets/8c5224f7-bc5e-4498-8a8e-134e9420e726)
  
  As you can see , we submit multiple transaction but only first one is confirmed
  Once one transaction is confirmed , we make others failed.
  Like Race.
  There are several way in implementing racing transaction
- - Use Smart Contract
  - Use Token Associated Account
  - Use Same Transaction Hash

# How to sell in Golden Chance ?

- We should calc all args without rpc call
it means we have to calc and make our mind to sell or not in transaction parsing 
Other things are same as above.

# pumpfun-racing-plugin-rust-sniper-bot ( Open to Discuss )
