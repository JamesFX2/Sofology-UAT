(function() {
	angular.module('app.sofology').controller('appController', AppController);

	AppController.$inject = ['$scope'];

	function AppController($scope){
		var vm = this;
		vm.bodyClasses = 'default';
		vm.canonicalURL = 'http://www.sofology.co.uk/';

		// this'll be called on every state change in the app
		$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		    if (angular.isDefined(toState.data.bodyClasses)) {
		        vm.bodyClasses = toState.data.bodyClasses;
				if (angular.isDefined(toState.url)) {
					if (angular.isDefined(toParams.id)) {
						
						vm.canonicalURL = 'http://www.sofology.co.uk'+(toState.url).replace(':id',toParams.id).replace('^/{id}','/'+toParams.id).replace('^','');
					}
					else vm.canonicalURL = 'http://www.sofology.co.uk'+toState.url;
				}
				return;
		    }

		    vm.bodyClasses = 'default';
		});
	}


})();



