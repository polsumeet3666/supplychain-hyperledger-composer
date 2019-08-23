# Property Registration Network

> This defines a business network where seller can sell property to buyer and get sales agreement  registered with network using authorized Registrar.

### Business network :

**Participant** :`Seller`, `Buyer`, `Registrar`.

**Asset** : `Property`,`PropertyListing`

**Transaction** :  `Created`,`Intent of Sale`,`Registered`




### Important Note & Assumptions:
Seller and Buyer can only **View the property if they own it.**
Only Registrar is authorized to perform  **Transaction** in network.
Admin create basic assets and participants because if property owner has access then he may create corrupt data. hence except Registrar all other participants have READ access only. 
For any transaction of assets the other participants will request registrar to submit transaction as he is authorized participant with all access.



### Prerequisite:
`Admin` is responsible to creation of `Assets` and `Participant` as a prerequisite for network.




### Participants Role:
* `Seller` can see only his details and **property owned by him only** on the network.

* `Seller` can get property `Created` on network by `Registrar`.

* `Seller` can get property listed by asking `Registrar` to submit `Intent of Sale` transaction for `Property`.

* `Seller` and `Buyer`can get there sale agreement `Registered ` by getting `Property` registered by `Registrar`.

* `Buyer` can view properties with status of **Intent of Sale ** on `PropertyListing`

* `Buyer` can see only  can see only his details and **property owned by him only** on the network.




### Permissions

`Registrar` has `ALL` access for  ** Property & PropertyListing** .

`Seller`has `READ` access for **Property Owned by him **.

`Buyer` has `READ` access for **Property with status 'Intent of Sale' on propertyListing.**

`Admin` has `ALL` access of all resources in the network.




### To test this Business Network Definition in the Test tab:


Create `Buyer`.
```
{
  "$class": "org.propertyregistration.network.Buyer",
  "name": "buyer1",
  "email": "buyer1@gmail.com",
  "id": "buyer1",
  "bankName": "HDFC",
  "bankAddress": {
    "$class": "org.propertyregistration.network.Address",
    "addressLine1": "baker street",
    "pincode": "400709",
    "city": "mumbai",
    "state": "MH",
    "country": "IN"
  },
  "bankAccountDetails": {
    "$class": "org.propertyregistration.network.BankAccountDetails",
    "accountNumber": 100,
    "balance": 1000,
    "IFSC": "KKBK1000"
  }
}
```



Create `Seller`.
```
{
  "$class": "org.propertyregistration.network.Seller",
  "name": "seller1",
  "email": "seller1@gmail.com",
  "id": "seller1",
  "bankName": "KOTAK",
  "bankAddress": {
    "$class": "org.propertyregistration.network.Address",
    "addressLine1": "Pine Street",
    "pincode": "400709",
    "city": "Mumbai",
    "state": "MH",
    "country": "IN"
  },
  "bankAccountDetails": {
    "$class": "org.propertyregistration.network.BankAccountDetails",
    "accountNumber": 100,
    "balance": 1000,
    "IFSC": "KKBK1000"
  },
  "saleDeedDocs": "b1c5d3620ce2bf96e024548e1c49b1bd"
}
```


Create `Registrar`
```
{
  "$class": "org.propertyregistration.network.Registrar",
  "id": "registrar1",
  "name": "registrar1",
  "email": "registrar1@gmail.com"
}
```



Create `Property`.
```
{
  "$class": "org.propertyregistration.network.Property",
  "PID": "1",
  "owner": "seller1",
  "registrationDate": "15.06.2019",
  "type": "TWO_BHK",
  "location": {
    "$class": "org.propertyregistration.network.Address",
    "addressLine1": "Pine street",
    "pincode": "400709",
    "city": "mumbai",
    "state": "MH",
    "country": "IN"
  },
  "public": false,
  "private": true,
  "marketPrice": 150,
  "intentOfSale": false,
  "status": "Registered"
}
```



Create `PropertyListing`.
```
{
  "$class": "org.propertyregistration.network.PropertyListing",
  "PLID": "1",
  "owner": "seller1",
  "registrationDate": "15.06.2019",
  "type": "TWO_BHK",
  "location": {
    "$class": "org.propertyregistration.network.Address",
    "addressLine1": "Pine Street",
    "pincode": "400709",
    "city": "Mumbai",
    "state": "MH",
    "country": "IN"
  },
  "status": "Created"
}
```



Submit `Created` transaction.
```
{
  "$class": "org.propertyregistration.network.Created",
  "PID": "10",
  "property": "resource:org.propertyregistration.network.Property#1"
}
```


Submit `IntentOfSale` transaction.
```
{
  "$class": "org.propertyregistration.network.IntentOfSale",
  "seller": "resource:org.propertyregistration.network.Seller#seller1",
  "propertyListing": "resource:org.propertyregistration.network.PropertyListing#1",
  "property": "resource:org.propertyregistration.network.Property#10"
}
```


Submit `Registered` transaction.
```
{
  "$class": "org.propertyregistration.network.Registered",
  "PID": "10",
  "propertyListing": "resource:org.propertyregistration.network.PropertyListing#1",
  "buyer": "resource:org.propertyregistration.network.Buyer#buyer1"
}
```