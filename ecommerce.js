// ## SUPPORT FUNCTIONS ###


function obfuscate(data) {
    /* Personally identifiable Info cannot be sent to GA. Basic function to quickly hash an email address
       Model doesn't expose customer ID so using this hash as convenient user ID. 
       If you do have some kind of customer ID that isn't an email address, feel free to use that instead
    */   
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


function buildProducts(entries)
{
    /* loops through vm.order.entries to get SKUs, name, product data, etc.
       category field could stand to be improved. We were going to use localStorage to check how a product was discovered 
       in the previous 120 days (internal search, direct, collection page, category page) 
       but development of this has become lower priority in last 4 months.
    */
    
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


// ## ACTUAL FUNCTION AMENDS ##
// ## SummaryController - Line 105 in webpack ##
// Look for....

  vm.order = res.data;
  
  // new stuff
  var transaction = {
      purchase: {

          actionField:
              {
                  id: vm.orderCode,
                  affiliation: vm.order.site,
                  revenue: vm.order.totalPriceWithTax.value,
                  tax: vm.order.totalTax.value,
                  shipping: vm.order.deliveryCost.value
              },
          products: buildProducts(vm.order.entries)

      }
  };
  
  // old stuff - think you did this for the PPC agency but it's not in the right format for GTM - happy to leave this 

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({

        "event" : "purchase",

        "orderId" : vm.orderCode, /* unique id for transaction */

        "revenue" : vm.order.totalPriceWithTax.value /* total transaction amount - after tax / after discount */

    });

  // more new stuff
  
  window.dataLayer.push({
        "event" : "transaction_complete",
        "ecommerce" : transaction,
        "eventCategory" : "Ecommerce",
        "eventAction" : "Order Completed",
        "clicked" : vm.order.user.uid.indexOf("@sofology.co.uk") > -1 ? "Sofology Staff" : "Public",
        "uid" : obfuscate(vm.order.user.uid)
    });
    
  /* event name unimportant, just configured to look for transaction_complete already
     ecommerce - JSON array structured as line 57
     eventCategory + eventAction - necessary
     clicked - using this field to allow marketing to understand who processed the order and can filter Sofology Staff vs Public
     uid - can't send email address to GA so using a "hash" of email address. If there's something better, use that.
  */
  
