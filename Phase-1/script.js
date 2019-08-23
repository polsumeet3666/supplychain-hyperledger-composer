/*
* Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
* Transaction Created to add the new property in the system
* @param {org.example.property.Created} tx
* @transaction
*/

async function Created(tx){
	console.log('Property Creation Transaction');

    //Getting the namespace and factory 	
    const factory = getFactory();
    const propertynamespace = 'org.example.property';
	
  	//Create the new property
    const property = factory.newResource(propertynamespace, 'Property', tx.PID);
    property.owner = tx.cproperty.owner;
    property.mktprice = tx.cproperty.mktprice;
    property.RegistrationDate = tx.cproperty.RegistrationDate;
  	property.PropertyType = tx.cproperty.PropertyType;
  	property.Location = tx.cproperty.Location;
  	//Setting the flags
  	property.Public = true;
  	property.Private = false;

    //Get the asset registry
    const registry = await getAssetRegistry(property.getFullyQualifiedType());
    // save the property
    await registry.add(property);
}


