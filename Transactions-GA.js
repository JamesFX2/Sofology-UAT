// this code is currently used to track transactions. In case of changes to the site, 
// it would be preferable to have this taken over by the internal developers so that continuous tracking can be maintained
// This is what we have used

// main function 

// key

/*

actionField:
{
  id: app.code, <- Transaction ID - required
  affiliation: app.site, <- Optional
  revenue: app.totalPriceWithTax.value, <- required
  tax: app.totalTax.value, <- required
  shipping: app.deliveryCost.value <- required
},

*/

po_analytics.handlers.orderComplete = function() {
            var app = "";
            po_analytics.tracking.constants.orders = po_analytics.tracking.constants.orders ? po_analytics.tracking.constants.orders : 0;
            // checks slow loading page up to 60 times every 2 seconds for a completed order
            try {
                app = angular.element($('div.basket')[0]).scope().model.order;
                var transaction = {
                    purchase: {

                        actionField:
                        {
                            id: app.code,
                            affiliation: app.site,
                            revenue: app.totalPriceWithTax.value,
                            tax: app.totalTax.value,
                            shipping: app.deliveryCost.value
                        },
                        products: po_analytics.custom.buildProducts(app.entries)

                    }
                };
                dataLayer.push({
                    "event" : "transaction_complete",
                    "ecommerce" : transaction,
                    "eventCategory" : "Ecommerce",
                    "eventAction" : "Order Completed",
                    "clicked" : app.user.uid.indexOf("@sofology.co.uk") > -1 ? "Sofology Staff" : "Public",
                    "uid" : po_analytics.support.obfuscate(app.user.uid)
                });
            }
            catch(err)
            {
                po_analytics.tracking.constants.orders++;
                if(po_analytics.tracking.constants.orders < 60)
                {
                    setTimeout(
                        function() {
                            po_analytics.handlers.orderComplete();
                        },2e3);
                }
            }

        }
        
        
 // support functions
 
 
po_analytics.custom.buildProducts = function(entries)
        {
        // loops through model.order.entries to get SKUs, name, product data, etc.
        
            var data = [];
            for(var i=0;i<entries.length;i++)
            {
                var container = {
                    id: entries[i].product.code,
                    name: entries[i].product.hasOwnProperty("name") ? entries[i].product.name : entries[i].range + " " + entries[i].swatchColour + " " + entries[i].bcop,
                    price: entries[i].totalPrice.value / entries[i].quantity,
                    brand:  entries[i].product.hasOwnProperty("name") ? "Sofology" : entries[i].range,
                    category : entries[i].product.hasOwnProperty("name") ? "Non-Sofas" : "Sofas",
                    variant : entries[i].product.hasOwnProperty("name") ? "" : entries[i].swatchName,
                    quantity: entries[i].quantity,
                    dimension11 : entries[i].savingsPrice && entries[i].savingsPrice.value ? entries[i].savingsPrice.value.toString() : "0",
                    dimension12 : entries[i].product.hasOwnProperty("name") ? "" : entries[i].swatchColour
                };
                data.push(container);
            }
            return data;
        }
        
        
 po_analytics.support.obfuscate = function(data) {
  // PII cannot be sent to GA. Basic function to quickly hash an email address
  // Model doesn't expose customer ID so using this hash as convenient user ID. 
            var encode = "";
            var total = 0;
            for (var i=0; i<data.length; i++)
            {
                if(i % 2 == 0)
                {
                    var ph = data.charAt(i).toLowerCase().charCodeAt(0)+(i % 4);
                    encode += String.fromCharCode(ph);
                }
                else
                {
                    var ph = data.charAt(i).toLowerCase().charCodeAt(0);
                    total += (ph*i);
                }
            }
            return encode+total;


        }
       
