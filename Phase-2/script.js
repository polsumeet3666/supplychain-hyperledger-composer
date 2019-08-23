'use strict';
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



// constant
const DOT = '.';
const PROPERTY = 'Property';
const PROPERTY_LISTING = 'PropertyListing';
const BUYER = 'Buyer';
const SELLER = 'Seller';
const INTENT_OF_SALE = 'Intent_of_Sale';
// constant for namespace
const NAMESPACE = 'org.propertyregistration.network';
// const fully qualified type (FQT)
const FQT_PROPERTY = NAMESPACE + DOT + PROPERTY;
const FQT_PROPERTY_LISTING = NAMESPACE + DOT + PROPERTY_LISTING;
const FQT_BUYER = NAMESPACE + DOT + BUYER;
const FQT_SELLER = NAMESPACE + DOT + SELLER;


/**
* This function is used by the participants to add new properties to the business network archive
* @param {org.propertyregistration.network.Created} tx
* @transaction
*/
async function Created(tx) {
    console.log('create txn start');

    // get factory instance
    const factory = getFactory();

    // create new property
    let property = factory.newResource(NAMESPACE, PROPERTY, tx.PID);
    property.PID = tx.PID;
    property.owner = tx.property.owner;
    property.registrationDate = tx.property.registrationDate;
    property.type = tx.property.type;
    property.location = tx.property.location;
    property.public = tx.property.public;
    property.private = tx.property.private;
    property.marketPrice = tx.property.marketPrice;
    property.intentOfSale = tx.property.intentOfSale;
    property.status = tx.property.status;

    try {
        //Get the asset registry
        const propertyRegistry = await getAssetRegistry(FQT_PROPERTY);

        // check if property is already registered
        let exists = await propertyRegistry.exists(tx.PID);
        if (exists){
            throw new Error(`Property with #-${tx.PID} already exits`);
        }
        console.log(`Property with PID : ${tx.PID} does not exits`);

        // adding new property to PropertyAssetRegistry
        await propertyRegistry.add(property);
        console.log(`Success: Property with PID: ${tx.PID} created successfully`);

        // removing previous property entry
        await propertyRegistry.remove(tx.property.PID);
        console.log('Previous property entry removed');

        return tx.PID;

    } catch (error) {
        console.log(error);
        console.log(`Error : Property with PID :${ tx.PID} already exists.`);
        return;
    }
}
// end for created

/**
* If the user decides to list the property for sale in the network, they can call the Intent for Sale function to perform the same
* @param {org.propertyregistration.network.IntentOfSale} tx
* @transaction
*/
async function intentOfSale(tx) {

    try{
        // get asset registries
        let propertyListingRegistry = await getAssetRegistry(tx.propertyListing.getFullyQualifiedType());
        let propertyRegistry = await getAssetRegistry(tx.property.getFullyQualifiedType());

        // check if property already exists
        let exists =  await propertyRegistry.exists(tx.property.PID);
        if (!exists){
            console.log(`Error : Property with PID : ${tx.property.PID} does not exists !!`);
            throw new Error(`Error : Property with PID : ${tx.property.PID} does not exists !!`);
        }

        console.log(`INFO : Property with PID : ${tx.property.PID} exists !!`);

        // updating propertyListing with status intent of sale
        tx.propertyListing.status = INTENT_OF_SALE;

        // updating propertyListing in asset registry
        await propertyListingRegistry.update(tx.propertyListing);
        console.log(`Status changed to "Intent_of_Sale for PLID : ${tx.propertyListing.PLID}`);

        // updating property asset with status intent of sale
        tx.property.status = INTENT_OF_SALE;
        tx.property.intentOfSale = true;

        // updating property in asset registry
        await propertyRegistry.update(tx.property);
        console.log(`Status changed to "Intent_of_Sale for PID : ${tx.property.PID}`);

        return tx.propertyListing.PLID;
    }catch(error){
        console.log(error);
        return;
    }
} //end of intent of sale transaction


/**
* If the user decides to list the property for sale in the network, they can call the Intent for Sale function to perform the same
* @param {org.propertyregistration.network.Registered} tx
* @transaction
*/
async function Registered(tx) {

    try {
        //Property ID
        let PID = tx.PID;

        // get asset registries
        let propertyRegistry = await getAssetRegistry(FQT_PROPERTY);
        let propertyListingRegistry = await getAssetRegistry(FQT_PROPERTY_LISTING);

        // get participant registries
        let buyerRegistry = await getParticipantRegistry(FQT_BUYER);
        let sellerRegistry = await getParticipantRegistry(FQT_SELLER);
        console.log(sellerRegistry);
        // check for property exits
        let exists = await propertyRegistry.exists(PID);
        if (!exists){
            console.log(`ERROR : Property with PID : ${PID} does not exits`);
            throw new Error(`ERROR : Property with PID : ${PID} does not exits`);
        }

        // get property from registry
        let propertyDetails = await propertyRegistry.get(PID);
        console.log(`DEBUG : property details ${JSON.stringify(propertyDetails)}`);

        // check buyer's account balance greater than market price of property
        if (tx.buyer.bankAccountDetails.balance < propertyDetails.marketPrice){
            console.log('Error : Insuffienct balance with buyer');
            throw new Error ('Error : Insuffienct balance with buyer');
        }
        console.log('DEBUG : buyer has balance to buy house');

        // debit property price from buyer
        tx.buyer.bankAccountDetails.balance -= propertyDetails.marketPrice;
        await buyerRegistry.update(tx.buyer);
        console.log(`Amount : ${propertyDetails.marketPrice} debited from Buyer's Account`);

        // credit property price to seller
        console.log(tx.propertyListing.owner);
        exists = await sellerRegistry.exists(tx.propertyListing.owner);
        console.log(exists);
        let seller = await sellerRegistry.get(tx.propertyListing.owner);
        console.log(seller);
        seller.bankAccountDetails.balance += propertyDetails.marketPrice;
        await sellerRegistry.update(seller);
        console.log(`Amount : ${propertyDetails.marketPrice} credited to Seller's Account`);

        //Add the new property owner to the property asset registry with the ‘registered’ status.
        propertyDetails.owner = tx.buyer.name;
        propertyDetails.status = 'Registered';

        // updating property asset on registry
        await propertyRegistry.update(propertyDetails);
        console.log('Success : Property details updated');

        // remove property from property listing
        await propertyListingRegistry.remove(tx.propertyListing);
        console.log('Property removed from Property Listing Successfully!!');

        // returning property ID
        return propertyDetails.PID;

    } catch (error) {
        console.log(error);
        return;
    }
} // end of registerd transaction
