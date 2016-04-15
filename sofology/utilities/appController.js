function() {
    "use strict";

    function e(e, t, n) {
        t.rule(function(e, t) {
            var n = t.path(),
                r = "/" === n[n.length - 1];
            if (r) {
                var a = n.substr(0, n.length - 1);
                return a
            }
        }), e.state("home", {
            url: "/",
            controller: "homeController",
            templateUrl: "views/home.html",
            controllerAs: "model",
            data: {
                bodyClasses: "home"
            }
        }).state("stores", {
            url: "/store-locator",
            controller: "storeController",
            templateUrl: "views/stores.html",
            data: {
                bodyClasses: "stores"
            }
        }).state("store-locator", {
            url: "/store-locator",
            controller: "storeController",
            templateUrl: "views/stores.html",
            data: {
                bodyClasses: "stores"
            }
        }).state("store", {
            url: "/store-locator/:id",
            controller: "StoreDetailsController",
            params: {
                id: null
            },
            templateUrl: "views/store.html",
            data: {
                bodyClasses: "store"
            }
        }).state("search", {
            url: "/search",
            templateUrl: "views/search.html",
            controller: "searchController"
        }).state("searchWithOption", {
            url: "/search/:option",
            params: {
                option: null
            },
            templateUrl: "views/search.html",
            controller: "searchController"
        }).state("range", {
            url: "/sofas/:id",
            params: {
                id: null
            },
            controller: "rangeController",
            controllerAs: "model",
            templateUrl: "views/range.html",
            data: {
                bodyClasses: "range"
            }
        }).state("catalogObsolete", {
            url: "/catalog/:id",
            params: {
                id: null
            },
            controller: "catalogController",
            controllerAs: "model",
            templateUrl: "views/catalog.html"
        }).state("terms", {
            url: "/termsandconditions",
            templateUrl: "views/termsandconditions.html",
            data: {
                bodyClasses: "terms"
            }
        }).state("sofology", {
            url: "/sofology",
            templateUrl: "views/sofology.html",
            data: {
                bodyClasses: "sofology"
            }
        }).state("privacyPolicy", {
            url: "/privacy-policy",
            templateUrl: "views/privacy-policy.html",
            data: {
                bodyClasses: "privacy"
            }
        }).state("aboutUs", {
            url: "/about-us",
            controller: "aboutUsController",
            templateUrl: "views/about-us.html",
            data: {
                bodyClasses: "aboutus"
            }
        }).state("outletType", {
            url: "/clearance-sofas/:outletType",
            params: {
                outletType: null
            },
            templateUrl: "views/outlet.html",
            data: {
                bodyClasses: "outlet"
            }
        }).state("clearanceSofas", {
            url: "/clearance-sofas",
            templateUrl: "views/outlet.html",
            data: {
                bodyClasses: "outlet"
            }
        }).state("catalog", {
            "abstract": !0,
            templateUrl: "views/catalog-header.html",
            controller: function() {},
            controllerAs: "vm",
            data: {
                bodyClasses: "shop-sofas"
            }
        }).state("catalog.detail", {
            url: "^/{id}-sofas",
            params: {
                id: null
            },
            controller: "catalogController",
            controllerAs: "model",
            templateUrl: "views/catalog.html"
        }).state("catalog.sofabeds", {
            url: "^/sofa-beds",
            params: {
                id: "sofabeds"
            },
            controller: "catalogController",
            controllerAs: "model",
            templateUrl: "views/catalog.html"
        }).state("catalog.latest", {
            url: "^/just-arrived",
            params: {
                id: "latest"
            },
            controller: "catalogController",
            controllerAs: "model",
            templateUrl: "views/catalog.html"
        }), t.otherwise("/"), n.html5Mode(!0)
    }
    angular.module("store").config(e), e.$inject = ["$stateProvider", "$urlRouterProvider", "$locationProvider"]
}();
