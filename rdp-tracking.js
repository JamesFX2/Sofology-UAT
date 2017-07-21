  // if you're reading this, maybe you're wondering why there's 2 events for adding an item
  // well Sofology call their products one thing on the RDP pages, another on the checkout and internally
  // So we add an item twice because we're using product dimension 13 to differentiate them (it's a dimension
  // called "Product - Discovery" inside GA.
  // Allowed values
  // 1. Category - shows product iist impressions, list clicks, product detail views
  // This shows how many people saw an item on a category page and later clicked on it.
  // 2. Colours - product list views, product list clicks
  // This shows how many people saw a particular swatch colour AND then clicked on it.
  // 3. Default - product details views, product adds to cart
  // As explained above, on the RDP page something might have SKU on 12444 and name of Bartelli Two Seater Sofa but internally, it will have a SKU of 12444 but a name of Bartelli Two Seater Sofa/Foam Fill
  // So we generate a detail view for the item showing up in the configurator, we generate an add to basket when the add button is clicked - but it has to end there.
  // 4. Ecommerce - product add to basket, product checkout, purchases
  // When something is added to basket, the API shoots back with the "proper" name and we track from this
  // For a conventional ecommerce site, this is all done in 1 but limitations applied


  // Email jamesflacks@gmail.com if you ever want to discuss this for whatever reason.
  // P.S. There's a ridiculous amount of custom reports - ask Sofology to share them with you or email PushON

  var po_343454 = {{cj - clean - Consistent Page Path}};

  if(po_343454.indexOf("/sofas") > -1 || po_343454.indexOf("/basket") > -1 || po_343454.indexOf("/packages") > -1)
  {
    // should be redundant
    var po_analytics = po_analytics || {};
    po_analytics.tracking = po_analytics.tracking || {};
    po_analytics.support = po_analytics.support || {};
    po_analytics.tracking.ecommerce = po_analytics.tracking.ecommerce || {};

    po_analytics.support.imageToSKU = function(url) {


      return url.substring(url.lastIndexOf("/")+1).split(".")[0].toUpperCase();

    };

    po_analytics.support.grabCurrentColour = function(brand) {
      var colour = "Missing", selector = document.querySelector('a.bazinga');
      if(selector !== null && selector.hasAttribute("onclick"))
      {
        try {
          colour = selector.getAttribute("onclick").split(brand.toLowerCase()+"', '")[1].split("'")[0];
        }
        catch(e)

        {
          // enjoy no colours
          // approach taken because reckon less likely to be changed
        }

      }

      return colour.trim();


    };

    po_analytics.tracking.ecommerce.discovery = function() {
      var index = {range: po_343454.toLowerCase().substring(po_343454.lastIndexOf("/")+1)};
      var data = {range: index.range, category: po_analytics.tracking.ecommerce.determine.category(), list: po_analytics.tracking.ecommerce.determine.list()};
      if(!po_analytics.safeStorage.notDuplicate("analytics-discovery",index,false,data))
      {
        data = po_analytics.safeStorage.readItem("analytics-discovery",index,"*")[0];
        // This forces the product to be identified as the first method it was discovered, at least for
        // the current session. If localStorage is available, we CAN make this cross-session but not initially
      }

      po_analytics.tracking.rdpInfo = data;
      // set cache
    };


    po_analytics.tracking.ecommerce.determine = {


      list : function() {


        if({{url - query - _s}} == "s")
        {
          return "Search Results";
        }
        else if({{url - query - category}})
        {
          return {{url - query - category}}.indexOf("StylePillar") > -1 ? "Collection" : "Category";
      }
      return "Direct";
    },
      category : function() {
        if({{url - query - _s}} == "s")
        {
          return "Search Results for "+{{url - query - k}};
      }
    else if({{url - query - category}})
    {
      return {{url - query - category}}.split("StylePillar")[0].replace(/([A-Z])/g, ' $1').trim();
  }
  return "Direct";

  }
  };


  po_analytics.tracking.ecommerce.rdpProductImpression = function() {

    // we need this function to be a busy little bee. It will need to satisfy a productDetail view for the type of stuff seen
    // on a category / search page
    // function run on page load only
    // 1. generates a product detail view for the Range itself (with dimension13 as category) so report that shows impressions (from search pages) can also show detail views
    // 2. generates a list of all the colour swatches available (with dimension13 as colours) so a report can show colour impressions vs colour clicks
    // 3. fires a click for the default selected swatch

    var ph = false, brand = $('span.ipn-name').text().trim().toUpperCase(), eventVar6 = $('button#switch-view-strip').hasClass('selected') ? "List View" : "Grid View";
    var ecommerce = {
      "currencyCode": "GBP", "impressions": [], "detail": {
        actionField : { list : po_analytics.tracking.rdpInfo.list ? po_analytics.tracking.rdpInfo.list : po_analytics.tracking.ecommerce.determine.list() },
        products: []
      },
      "click" : {}
    }, product = {}, impression = {}, colour = po_analytics.support.grabCurrentColour(brand);

    if(po_analytics.tracking.constants.firedRDP !== true)
    {
      po_analytics.tracking.constants.firedRDP = true;
      ecommerce.click = po_analytics.tracking.ecommerce.rdpSelectedSwatch();
      // i.e. fires once, we're creating a 2 tier system for products for reporting reasons
      // products on category, search pages are given dimension13 as Category and the name

      var sku = $('div.lifestyle img').length > 0 ? po_analytics.support.imageToSKU($('div.lifestyle img')[0].src) : {{url - query - code}};

    product = {
      name: brand,
      id: sku, // SKU
      price: undefined,
      brand: brand,
      category: po_analytics.tracking.rdpInfo.category,
      //dimension11: undefined, // delivery
      //dimension12:  undefined, // format
      dimension13: "Category",
      //dimension14: "New", // Item grade
      //dimension16: undefined,
      //dimension17: undefined,
      //dimension18: undefined, // Recliner type (if option)
      //variant: undefined,
      position: undefined
      // might need to retain
    };
    ecommerce.detail.products.push(product);
    if(window.fbq) 
    {

      fbq('track', 'ViewContent', {  content_name: brand, content_category: po_analytics.tracking.rdpInfo.category,
                                   content_ids: [sku],  content_type: 'product_group' });


    }
  }



  $('div.colour-picker div.slick-colour div.slick-track figure').not('figure.slick-cloned').each(function(position) {
    var $ph = $(this), colour = "Missing";

    try {

      colour = $ph.find('a').attr('onclick').split("', ")[0].split("('")[1].trim();

    }
    catch(e) {


    }


    impression = {
      name: brand, // Name format for this one has to be brand
      id: po_analytics.support.imageToSKU($ph.find('img')[0].src), // SKU
      price: undefined,
      brand: brand,
      list: po_analytics.tracking.rdpInfo.list ? po_analytics.tracking.rdpInfo.list : po_analytics.tracking.ecommerce.determine.list(),
      category: po_analytics.tracking.rdpInfo.category,
      //dimension11: undefined, // delivery
      //dimension12: undefined, // format
      dimension13: "Colours", // Selected vs Default
      // dimension14: "New", // Item grade
      //dimension16: undefined, // Filling (if option),
      //dimension17: undefined, // Feet (if option),
      //dimension18: undefined, // Recliner type (if option)
      variant: colour.toUpperCase(),
      position: position

    };
    ecommerce.impressions.push(impression);

  });

  if(ecommerce.impressions.length > 40)
  {
    // 8kb hit size in GA - have to split over 2 events
    var ph = ecommerce.impressions.splice(40);


  }

  dataLayer.push({event: "swatch_impressions", clicked: "Loaded", ecommerce: ecommerce, eventVar6: eventVar6, eventVar7: undefined, eventVar8: undefined, swatchesViewed: 1, modelsViewed: 0, itemsBasket: 0});
  if(ph) {

    (function(impressions,eV6) {

      // ensure that this has a different timestamp
      setTimeout(function() {

        var ecommerce = {
          "currencyCode": "GBP", "impressions": impressions
        };
        dataLayer.push({event: "swatch_impressions", clicked: "Loaded", ecommerce: ecommerce, eventVar6: eV6, eventVar7: undefined, eventVar8: undefined, swatchesViewed: 0, modelsViewed: 0, itemsBasket: 0});

      }, 1.5e3);

    })(ph,eventVar6);


  }


  };

  po_analytics.tracking.ecommerce.rdpSelectedSwatch = function(ce, ownEvent) {
    // function associated with selecting a colour/swatch (top)
    // generates a product click (with dimension13 as Colours/Colours*) to complete the impressions vs clicks report
    // functionality to fire a product impression for the items loaded by clicking on the colour/swatch was
    // removed because the full list of products isn't generated until the configurator slider is launched (i.e.
    // foot options, filling options, recliner options) so it would be an inconsistent/confusing report

    ownEvent = typeof ownEvent === "undefined" ? false : ownEvent;
    var cc = typeof ce === "undefined" ? undefined : ce.className;

    var viewtype = $('button#switch-view-strip').hasClass('selected') ? "List View" : "Grid View", $ph = "", howSelected = undefined;
    if(ce !== undefined)
    {
      $ph = viewtype == "Grid View" ? $(ce).closest('div.colour-picker div.slick-colour div.slick-track figure') : $('div.colour-picker div.slick-colour div.slick-track figure.slick-current');
      howSelected =  viewtype == "Grid View" ? "Click" : cc == 'fa fa-strip-view' ? "View Switch" : cc.indexOf("fa-angle-right") > -1 ? "Right Arrow" : "Left Arrow";
    }

    else $ph = $('div.colour-picker div.slick-colour div.slick-track figure.slick-current').length ? $('div.colour-picker div.slick-colour div.slick-track figure.slick-current') : $('div.colour-picker div.slick-colour div.slick-track figure.active');
    var colour = "Missing", click = {}, brand = $('span.ipn-name').text().trim().toUpperCase();
    var ecommerce = {
      "currencyCode": "GBP",
      click: {
        actionField: {
          list: po_analytics.tracking.rdpInfo.list ? po_analytics.tracking.rdpInfo.list : po_analytics.tracking.ecommerce.determine.list()
        },
        products: []
      }
    };


    try {

      colour = $ph.find('a').attr('onclick').split("', ")[0].split("('")[1].trim().toUpperCase();

    }
    catch(e) {


    }


    click = {
      name: brand, // Name format for this one has to be brand
      id: po_analytics.support.imageToSKU($ph.find('img')[0].src), // SKU
      price: undefined,
      brand: brand,
      list: po_analytics.tracking.rdpInfo.list ? po_analytics.tracking.rdpInfo.list : po_analytics.tracking.ecommerce.determine.list(),
      category: po_analytics.tracking.rdpInfo.category,
      dimension11: undefined, // delivery
      dimension12: undefined, // format
      dimension13: ownEvent ? "Colours" : "Colours*", // Selected vs Default
      dimension14: "New", // Item grade
      dimension16: undefined, // Filling (if option),
      dimension17: undefined, // Feet (if option),
      dimension18: undefined, // Recliner type (if option)
      variant: colour,
      position: $('div.colour-picker div.slick-colour div.slick-track figure').index($ph)

    };

    ecommerce.click.products.push(click);


    if(ownEvent && po_analytics.safeStorage.notDuplicate("temp_colours",{colour:colour},false))
    {
      dataLayer.push({event: "swatch_click", clicked: "Swatch Selected", ecommerce: ecommerce, eventVar6: viewtype, eventVar7: howSelected, eventVar8: colour, swatchesViewed: 1, modelsViewed: 0, itemsBasket: 0});
    }
    else return ecommerce.click;

  };



  po_analytics.tracking.ecommerce.rdpProductDetail = function(clickElement) {

    // generates a product detail (with dimension13 as Default) for the currently selected item.
    // triggered either via clicking on the magnifying glass or the configurator slider
    // this is stuff in the configurator!


    var name = undefined, price = undefined, delivery = undefined, options = {}, eventVar6 = "Add to Basket";

    if(clickElement !== undefined && clickElement !== null)
    {
      var cc = clickElement.className;
      eventVar6 = cc.indexOf("fa-search-plus") > -1 ? "Sofa Slider - Magnifying Glass" : cc.indexOf('pull-right btn btn--dark  btn--soft') > -1 ? "Sofa Slider - Options Button" : cc.indexOf("fa-angle") > -1 ? "Sofa Configurator - Arrows" : "Sofa Configurator - Option Click";
    }

    var brand = $('span.ipn-name').text().trim().toUpperCase();
    var ecommerce = {
      "currencyCode": "GBP", "impressions": [], "detail": {
        actionField : { list : po_analytics.tracking.rdpInfo.list },
        products: []
      }
    }, product = {}, tSKU = "", tPrice = 0;
    var colour = po_analytics.support.grabCurrentColour(brand), position = 0;

    //we generate detail views for the default opened items


    $('div.slick-configure-full.basket-enabled  div.slick-slide.slick-active').not('div.slick-cloned').each(function() {

      var $ph = $(this);
      position = $('div.slick-configure-full.basket-enabled  div.slick-slide').not('div.slick-cloned').index($ph); //

      // in the case of multiple options in the same window, e.g. 2 Seater Sofa / Vittorio which is available as no recliner or double power recliner
      // both will share the same position - it's a lot more work to get the effective position
      // maybe later!

      var $options = $ph.find('div.config__col').not('div.config__col--summary');
      if($options.length > 0)
      {
        // options
        $options.each(function() {
          var $option = $(this).find('div.active');
          options[$option.attr('data-option-group')] = $option.attr('data-option-value');
        });
      }

      var $details = $ph.find('div.config__col__summary p'), format = $ph.find('div header h3').text().trim();

      name = brand + " " + $details[0].textContent.trim();
      delivery = $details[1] ? $details[1].textContent.trim() : undefined;
      tSKU = po_analytics.support.imageToSKU($ph.find('div.modal__inner img')[0].src), tPrice = parseFloat($ph.find('div.config__col__price p').text().replace("£",""));

      product = {
        name: name.toUpperCase(), // Name format = upper case Range + upper case Colour
        id: tSKU, // SKU
        price: tPrice,
        brand: brand,
        category: po_analytics.tracking.rdpInfo.category,
        list: po_analytics.tracking.rdpInfo.list, // not needed by GA, semi-needed by us though. GA has list attribution
        // so probably not needed but keeping it for debugging
        // should be ignored - just to confirm, for product detail the actionField list is used
        dimension11: delivery, // delivery
        dimension12:  format, // format
        dimension13: "Default", // Selected vs Default
        dimension14: "New", // Item grade
        dimension15: options["Colour"], // not real colour, it's some kind of pattern on footstools
        dimension16: options["Filling"], // Filling (if option),
        dimension17: options["Foot"], // Feet (if option),
        dimension18: options["Recliner"], // Recliner type (if option)
        dimension19: options["Back"], // Back options
        variant: colour.toUpperCase(),
        position: position
      };
      ecommerce.detail.products.push(product);

      if(window.fbq) 
      {
        var tOutput =   { content_name: name.toUpperCase(), content_category: po_analytics.tracking.rdpInfo.category,
                                     content_ids: [tSKU],  content_type: 'product', currency: "GBP", value: tPrice,
                                     product_delivery: delivery, product_format: format, product_grade: "New",
                                     product_filling: options["Filling"], product_feet: options["Foot"], 
                                     product_reclinerstyle : options["Recliner"], product_backstyle: options["Back"], product_colour : colour.toUpperCase()  };

        (function(data) {
          setTimeout(function() {
            
                   fbq('track', 'ViewContent', data);            
            
          },2e3);
        })(tOutput);


      }

    });


    if(po_analytics.safeStorage.notDuplicate("analytics-sku",{id:product.id},false,product))
    {
      // save this in case they add via the checkout basket. Also allows us to append details to completed transactions
      // with a lookup on SKU.

      dataLayer.push({event: "product_detail_load", clicked: "Product Selected", ecommerce: ecommerce, eventVar6: eventVar6, eventVar7: name, eventVar8: product.dimension12, swatchesViewed: 0, modelsViewed: 1, itemsBasket: 0});
    }
    if(clickElement === undefined)
    {
      return product;
    }

  };

  po_analytics.tracking.ecommerce.arrowClick = function(clickElement) {

    var cc = clickElement.className.length > 1 ? clickElement.className : "ipn";
    if(/fa fa\-(grid|strip)\-view/i.test(cc))
    {
      if(po_analytics.safeStorage.notDuplicate("temp_debounce", {action: cc}, false))
      {
        dataLayer.push({ event: "rdp_ux_switch", clicked: cc.indexOf("grid") > -1 ? "Swatch - Switch to Grid View" : "Swatch - Switch to Strip View", eventVar6: $('div.colour-picker div.slick-colour div.slick-track figure').not('figure.slick-cloned').length });
      }


    }
    else if(cc == "ipn")
    {
      if(po_analytics.safeStorage.notDuplicate("temp_debounce", {action: cc}, false) && $("li a[href*='#']").index(clickElement) > -1)
      {
        dataLayer.push({ event: "rdp_ux_ipn", clicked: "Scroll - IPN", eventVar6: $("li a[href*='#']").index(clickElement) });
      }


    }
    else if(/fa fa\-angle\-(left|right)/i.test(cc))
    {
      var type = clickElement.matches('div.colour-picker i') ? "Swatch" : "Slider";
      if(po_analytics.safeStorage.notDuplicate("temp_debounce", {action: cc, type: type}, false))
      {
        dataLayer.push({ event: "rdp_ux_arrows", clicked: cc.indexOf("right") > -1 ? type+" - Right Arrow" : type+" - Left Arrow", eventVar6: type == "Swatch" ? $('button#switch-view-strip').hasClass('selected') ? "List View" : "Grid View" : $('div.slick-configure-full.basket-enabled  div.slick-slide').not('div.slick-cloned').length });
      }
    }
    else if(cc == "close")
    {

      if(po_analytics.safeStorage.notDuplicate("temp_debounce", {action: cc}, false))
      {
        dataLayer.push({ event: "rdp_ux_close", clicked: "Configurator - Closed Window", eventVar6: undefined });
      }
    }
    else if(cc == 'fa fa-pagination-static')
    {
      if(po_analytics.safeStorage.notDuplicate("temp_debounce", {action: cc}, false))
      {
        dataLayer.push({ event: "rdp_ux_pagination", clicked: "Slider - Pagination", eventVar6: $('div.slick-configure-full.basket-enabled  div.slick-slide').not('div.slick-cloned').length });
      }
    }


  };

  po_analytics.tracking.ecommerce.addToBasket = function(clickElement) {

    var $ph = $(clickElement).closest('div.slick-slide');
    var sku = po_analytics.support.imageToSKU($ph.find('div.modal__inner img')[0].src), product = "";
    product = po_analytics.tracking.ecommerce.rdpProductDetail();

    // if timing is off, no SKU will be saved

    if(product)
    {
      product.quantity = parseInt($ph.find('div.quantity input.quantity__itemAmount').val());
      product.dimension13 = "Default";
      var ecommerce = {
        "currencyCode": "GBP",
        "add" : {
          actionField: {
            list: product.list
          },
          products: [product]
        }
      };
      dataLayer.push({"event": "product_add", clicked: "Item - Add", "eventVar6" : product.name, "eventVar7" : product.quantity, "eventVar8" : product.dimension12, "ecommerce": ecommerce, swatchesViewed: 0, modelsViewed: 0, itemsBasket: 0});

    }


  };

  po_analytics.tracking.ecommerce.loadBasket = function() {
    // function to load basket into memory so that any changes can be checked by looping through. Simplifies everything
    // because a function is triggered by the basketChange event their developers created
    if ({{cookie - sofologyBasket - localStorage Disabled}} || {{js - sofologyBasket - localStorage}})
    {
      var raw = {{cookie - sofologyBasket - localStorage Disabled}} || {{js - sofologyBasket - localStorage}};
  var items = JSON.parse(raw).entries, item = "";
  if(items !== undefined && items.length > 0){


    for(var i=0; i<items.length; i++)
    {
      item = {
        id: items[i].product.code.toUpperCase(),
        quantity: items[i].quantity,
        name: items[i].product.hasOwnProperty("name") ? items[i].product.name.toUpperCase() : (items[i].range + " " + items[i].bcop).toUpperCase(),
        brand:  items[i].product.hasOwnProperty("name") ? "Sofology" : items[i].range.toUpperCase(),
        variant : items[i].product.hasOwnProperty("name") ? "" : items[i].swatchColour.toUpperCase()

      };
      po_analytics.safeStorage.notDuplicate("temp_basket",item,false);
    }


  }


  }


  };


  po_analytics.tracking.ecommerce.checkBasket = function(cookie,local) {
    po_analytics.safeStorage.updateItem("temp_basket", {}, {found: false});
    var ph = po_analytics.safeStorage.readItem("temp_basket", {}, "*");
    po_analytics.tracking.constants.rtCart = [];
    po_analytics.tracking.constants.rtCartIndex = {};
    var raw = cookie || local;
    var entries = JSON.parse(raw).entries, item = "";
    if(entries !== undefined && entries.length > 0)
    {
      for(var i=0; i<entries.length; i++) {
        var sku = entries[i].product.code.toUpperCase();

        item = {
          id: sku,
          name: entries[i].product.hasOwnProperty("name") ? entries[i].product.name.toUpperCase() : (entries[i].range + " " + entries[i].bcop).toUpperCase(),
          price: entries[i].totalPrice.value / entries[i].quantity,
          brand:  entries[i].product.hasOwnProperty("name") ? "Sofology" : entries[i].range.toUpperCase(),
          variant : entries[i].product.hasOwnProperty("name") ? "" : entries[i].swatchColour.toUpperCase(),
          quantity: entries[i].quantity,
          found: false,
        };


        po_analytics.tracking.constants.rtCartIndex[sku] = po_analytics.tracking.constants.rtCart.push(item) - 1;
        // save mapping to sku to prevent parsing
      }

    }
    if(po_analytics.tracking.constants.rtCart.length > 0)
    {
      for (var i = 0; i < po_analytics.tracking.constants.rtCart.length; i++) {
        for (var j = 0; j < ph.length; j++) {
          if (ph[j].id == po_analytics.tracking.constants.rtCart[i].id) {
            po_analytics.tracking.constants.rtCart[i].found = true;
            ph[j]["found"] = true;
            if (ph[j].quantity !== po_analytics.tracking.constants.rtCart[i].quantity) {
              po_analytics.tracking.ecommerce.updateBasket(ph[j], po_analytics.tracking.constants.rtCart[i].quantity - ph[j].quantity, "update");
              // can be positive, can be negative
            }
          }
        }
      }
      for (var i = 0; i < ph.length; i++) {
        if (typeof ph[i].found !== "undefined" && !ph[i].found) {
          po_analytics.tracking.ecommerce.updateBasket(ph[i], ph[i].quantity * -1, "delete");
        }

      }
    }
    else if(ph)
    {
      // they emptied the cart! Boo!
      for(var j = 0; j < ph.length; j++ )
      {
        po_analytics.tracking.ecommerce.updateBasket(ph[j], ph[j].quantity * -1, "delete")
      }

    }
    for (var i = 0; i < po_analytics.tracking.constants.rtCart.length; i++) {
      // this is the new stuff!
      if (!po_analytics.tracking.constants.rtCart[i].found) {
        po_analytics.tracking.ecommerce.updateBasket(po_analytics.tracking.constants.rtCart[i], po_analytics.tracking.constants.rtCart[i].quantity, "new");
      }


    }



  };

  po_analytics.tracking.ecommerce.updateBasket = function (items, quantity, method) {
    //console.log(JSON.stringify(items));
    var action = quantity > 0 ? "add" : "remove";
    var event = quantity > 0 ? "basket_add" : "basket_remove";

    var ecommerce = {
      "currencyCode": "GBP"
    };
    var apiData = po_analytics.tracking.constants.rtCart[po_analytics.tracking.constants.rtCartIndex[items.id]] ? po_analytics.tracking.constants.rtCart[po_analytics.tracking.constants.rtCartIndex[items.id]] : {};
    //console.log(JSON.stringify(po_analytics.tracking.constants.rtCartIndex));
    //console.log(JSON.stringify(po_analytics.tracking.constants.rtCart));
    if(apiData.id == items.id)
    {
      items.name = apiData.name;
      items.price = apiData.price;
      items.brand = apiData.brand;
      items.variant = apiData.variant;
    }
    else {
      var ph = po_analytics.safeStorage.readItem("temp_basket", {id: items.id}, "*");
      if(ph && ph[0])
      {
        items.name = ph[0].name;
        items.price =  ph[0].price;
        items.brand =  ph[0].brand;
        items.variant =  ph[0].variant;
        // wow this is spaghetti code. I could probably clean this up substantially but next push                

      } else items.name = "Error";
    }

    var additionalData = po_analytics.safeStorage.readItem("analytics-sku", {id: items.id}, "*");
    if(additionalData && additionalData[0] && additionalData[0].id == items.id ) {
      // merging in additional data to enrich in data saved from discovery
      items.category = additionalData[0].category ? additionalData[0].category : window.location.href.indexOf("/basket") > -1 ? "Shopping Basket" : "Direct";
      items.list = additionalData[0].list ? additionalData[0].list : "Direct";
      items.position = additionalData[0].position ? additionalData[0].position : 0;
      items.dimension11 = additionalData[0].dimension11 ? additionalData[0].dimension11 : undefined;
      items.dimension12 = additionalData[0].dimension12 ? additionalData[0].dimension12 : undefined;
      items.dimension13 = "Ecommerce";
      items.dimension14 = additionalData[0].dimension14 ? additionalData[0].dimension14 : "New";
      items.dimension15 = additionalData[0].dimension15 ? additionalData[0].dimension15 : undefined;
      items.dimension16 = additionalData[0].dimension16 ? additionalData[0].dimension16 : undefined;
      items.dimension17 = additionalData[0].dimension17 ? additionalData[0].dimension17 : undefined;
      items.dimension18 = additionalData[0].dimension18 ? additionalData[0].dimension18 : undefined;
      items.dimension19 = additionalData[0].dimension19 ? additionalData[0].dimension19 : undefined;
    }
    else {
      // i.e. event timing was wrong, excess localStorage used, too much cookie space
      if(items.brand)
      {
        additionalData = po_analytics.safeStorage.readItem("analytics-discovery", {range: items.brand.toLowerCase()}, "*");
        if(additionalData && additionalData[0])
        {
          items.category = additionalData[0].category;
          items.list = additionalData[0].list;
        }

      }
      items.category = items.category ? items.category : window.location.href.indexOf("/basket") > -1 ? "Shopping Basket" : "Direct";
      items.list = items.list ? items.list : "Direct";
      items.position = items.position ? items.position: 0;
      items.dimension13 = "Ecommerce";
      items.dimension14 = items.dimension14 ? items.dimension14 : "New";
    }

    delete items.found;
    delete items.sessionID;
    delete items.ts;

    var ph = items.quantity;

    items.quantity = quantity > 0 ? quantity : quantity * -1;
    ecommerce[action] = {"products": [items], actionField: {list: items.list}};
    var temp = JSON.stringify(ecommerce);
    // cloning because tag manager seems to send wrong quantity

    dataLayer.push({"event": event, clicked: "EE Item - "+action.charAt(0).toUpperCase() + action.slice(1), swatchesViewed: 0, modelsViewed: 0, "eventVar6" : items.name, "eventVar7" : items.quantity, "eventVar8" : items.dimension12, "ecommerce": JSON.parse(temp), itemsBasket: quantity });


    if (method == "new") {
      po_analytics.safeStorage.write("temp_basket", items);
    }
    else if (method == "delete") {
      po_analytics.safeStorage.updateItem("temp_basket", {id: items.id}, "delete");
    }
    else {
      items.quantity = ph + quantity;
      po_analytics.safeStorage.updateItem("temp_basket", {id: items.id}, items);
    }

  };

  if(po_343454.indexOf("/sofas") > -1 )
  {
    po_analytics.tracking.ecommerce.discovery();
    po_analytics.tracking.ecommerce.rdpProductImpression();
  }

  po_analytics.tracking.ecommerce.loadBasket();
  $(document).on("basketUpdated", function() {
    dataLayer.push({"event" : "basketUpdated" });
  });


  }

