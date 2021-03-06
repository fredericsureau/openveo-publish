
'use strict';

angular.module('vds.multirange', ['vds.multirange.lite', 'vds.utils'])
  .directive('vdsMultirange',["vdsMultirangeViews", function (vdsMultirangeViews) {
    return {
      required: 'ngModel',
      scope: {
        ngModel: '=',
        _views: '=views',
        _view: '=view',
        onSelect: '=',
        onMouserelease : "=",
        onEnablemouseover: "="
      },
      template:
      '<div class="vds-multirange-mk2-container">' +
        '<vds-multirange-labels render="renderedStyle" on-enablemouseover="onEnablemouseover"  on-select="onSelect" ng-model="ngModel"></vds-multirange-labels>' +
        '<vds-multirange-lite ng-model="ngModel" on-select="onSelect" on-enablemouseover="onEnablemouseover" on-mouserelease="onMouserelease" ng-style="renderedStyle.multirange" step="step"></vds-multirange-lite>' +
        '<vds-multirange-hairlines render="renderedStyle" ng-model="units"></vds-multirange-hairlines>' +
      '</div>',
      link: function (scope, elem, attr) {
        scope.getPercent = function(value) {
          return (value*100) + '%';
        };

        scope.changeView = function (n) {
          if(typeof n == 'undefined' || typeof scope.views == 'undefined') return;
          var l = scope.views.length-1, view;
          n = (n < 0)? 0 : ( (n > l)? l : n );
          view = scope.views[n];
          if(typeof view != 'undefined') {
            scope.zoom = view.zoom;
            scope.step = view.step;
            scope.units = view.units;
            scope.renderer();
          }
        };

        scope.$watch('_view', function (n) {
          scope.changeView(n);
        });

        scope.$watch('_views', function (n) {
          scope.views = n;
          scope.view = 0;
          scope.changeView(0);
        });

        scope.renderer = function () {
          if(typeof scope.zoom == 'undefined') return;
          var render = {
            container: {},
            content: {},
            multirange: {
              width: scope.getPercent(scope.zoom),
              display: 'block',
              margin: 'auto'
            }
          };

          if(scope.zoom < 1) {
            render.content.margin = '2 auto';
            render.content.width = 'calc('+scope.getPercent(scope.zoom)+' - 10px)';
            render.container.marginLeft = '0';
          } else {
            render.content.margin = '2 0';
            render.content.width = 'calc('+scope.getPercent(scope.zoom)+' - '+ ( 10 - ( scope.zoom * 5 ) ) +'px)';
            render.container.marginLeft = '5px';
          }
          return scope.renderedStyle = render;
        };

        // set default view config
        if(typeof scope.views == 'undefined') {
          scope.views = vdsMultirangeViews.DEFAULT;
          scope.view = 0;
          scope.changeView(0);
        }

      }
    };
  }])
  .directive('vdsMultirangeLabels', function () {
    return {
      restrict: 'E',
      scope: {
        ngModel: '=',
        render: '=',
        onSelect : '=',
        onEnablemouseover : '='
      },
      template:
      '<div class="vds-multirange-mk2-labels-container" ng-style="render.container">' +
        '<ul class="vds-multirange-mk2-labels" ng-style="render.content">' +
          '<li class="vds-multirange-mk2-label" ng-class="{\'active\':range.select}" ng-repeat="range in ngModel" ng-style="renderRange(range)" ng-mouseover="mouseover(range, onSelect, onEnablemouseover)" >' +
            '<span ng-if="range.name && !range.type">{{ range.name }}</span>' +
            '<span ng-if="!range.name && !range.type"><div class="glyphicon glyphicon-map-marker"></div></span>' +
            '<span ng-if="range.type && range.type==\'begin\'" ng-class="range.type"><div class="glyphicon glyphicon-log-out"></div></span>'+
            '<span ng-if="range.type && range.type==\'end\'" ng-class="range.type"><div class="glyphicon glyphicon-log-in"></div></span>'+
          '</li>' +
        '</ul>' +
      '</div>',
      link: function (scope, elem, attr) {
        scope.renderRange = function (range) {
          return {
            left: (range.value*100)+'%',
            zIndex: range._depth
          }
        }
        scope.mouseover = function(range, select, condition){
          if(!range.select && condition) select(range.value);
        }
      }
    }
  })
  .directive('vdsMultirangeHairlines', function () {
    return {
      restrict: 'E',
      scope: {
        ngModel: '=',
        render: '='
      },
      template:
      '<div class="vds-multirange-mk2-hairlines-container" ng-style="render.container">'+
        '<ul class="vds-multirange-mk2-hairlines" ng-style="render.content">' +
          '<li class="vds-multirange-mk2-hairline" ng-repeat="hairline in hairlines" ng-style="hairline.render">' +
            '<span>{{ hairline.label }}</span>' +
          '</li>' +
        '</ul>' +
      '</div>',
      link: function (scope, elem, attr) {

        scope.$watch('ngModel', function (n) {
          if(typeof n == 'undefined') return;
          scope.hairlines = [];
          var levels = n.length, hairHeight = 12, hairline, i, j, u;
          for(i = 0; i < levels; i++) {
            u = n[i];
            for( j = 0; ((j>1)? Math.round(j*1000)/1000 : j) <= 1; j = parseFloat((j + u.value).toFixed(8)) ) {
              hairline = {
                render: {
                  height: hairHeight * (1 - i / levels),
                  left: (j*100)+'%'
                }
              }
              if(typeof u.labeller == 'function') {
                hairline.label = u.labeller(j);
              } else if(typeof u.labeller != 'undefined') {
                hairline.label = j;
              }
              scope.hairlines.push(hairline);
            }
          }
        });

      }
    };
  })
  .factory('vdsMultirangeViews',["vdsUtils", function (vdsUtils) {
    var tv = vdsUtils.time.fromTimeToValue,
      vt = vdsUtils.time.fromValueToTime,
      pad = vdsUtils.format.padZeroes;
      
    return {
      TIME: function(duration){
        duration = duration*1000;
        return [
        { zoom: 0.9, step: tv(0, 1 ,0, duration), units: [
          { value: tv(0,20,0, duration), labeller: function (n) { 
              var time = vt(n,duration);
              var label = time.hours!=0?time.hours+'h' : '';
              return label+time.minutes+'m'; } },
          { value: tv(0,5,0, duration) }
        ] },
        { zoom: 2, step: tv(0,0,10, duration), units: [
          { value: tv(0,10,0, duration), labeller: function (n) { 
              var time = vt(n,duration);
              var label = time.hours!=0?time.hours+'h' : '';
              return label+time.minutes+'m';
            } },
          { value: tv(0,2,0, duration) }
        ] },
        { zoom: 4, step: tv(0,0,1, duration), units: [
          { value: tv(0,5,0, duration), labeller: function (n) { 
               var time = vt(n,duration);
              var label = time.hours!=0?time.hours+'h' : '';
              return label+time.minutes+'m';
            } },
          { value: tv(0,1,0, duration) },
        ] },
        { zoom:8, step: tv(0,0,1, duration), units: [
//          { value: tv(1,0,0, duration), labeller: function (n) { return vt(n,duration).hours+'h'} },
          { value: tv(0,2,0, duration), labeller: function (n) { 
               var time = vt(n,duration);
              var label = time.hours!=0?time.hours+'h' : '';
              return label+time.minutes+'m';
            } },
          { value: tv(0,0,30, duration) }
        ] }
      ];
      }
    }
  }]);

angular.module('vds.multirange.lite', [])
  .directive('vdsMultirangeLite', function () {
    return {
      required: 'ngModel',
      scope: {
        ngModel: '=',
        step: '=',
        onSelect: '=',
        onMouserelease : "=" ,
        onEnablemouseover: '='
      },
      template:
      '<div class="vds-multirange-container" ng-mousemove="onMouseMove($event)">' +
        '<div class="vds-multirange-track"></div>' +
        '<div class="vds-multirange-wrapper" ng-repeat="range in ngModel" ng-style="computeDepth(range)" ng-mouseup="mouserelease(onMouserelease)"  ng-mouseover="mouseover(range, onSelect, onEnablemouseover)" >' +
          '<vds-range class="vds-multirange" ng-class="{\'active\':range.select}" position="range.value" min="0" max="{{ precision }}" step="{{ preciseStep }}">' +
        '</div>' +
      '</div>',
      link: function (scope, elem, attr) {
        var mousex;
        scope.precision = 1000000;
        scope.preciseStep = 1;
        scope.onMouseMove = function (evt) {
          var bound = elem[0].getBoundingClientRect();
          mousex = (evt.pageX - bound.left) / bound.width;
        };
        scope.mouserelease = function(release){
          release();
        }
        scope.mouseover = function(range, select, condition){
          if(!range.select && condition) select(range.value);
        }
        scope.computeDepth = function (range) {
          range._depth = 100 - Math.round(Math.abs(mousex-range.value)*100);
          return {
            zIndex: range._depth
          };
        };
        scope.$watch('step', function () {
          if(typeof scope.step == 'undefined') {
            scope.preciseStep = 1;
          } else {
            scope.preciseStep = scope.step * scope.precision;
          }
        });
      }
    };
  })
  .directive('vdsRange',["$timeout", function ($timeout) {
    return {
      template: '<input type="range" ng-model="rdh.mulValue">',
      restrict: 'E',
      replace: true,
      scope: {
        position: '='
      },
      link: function (scope, elem, attr) {
        elem.bind('click', function (event) {
        event.preventDefault();
        event.stopPropagation();});

        var RangeDataHelper = function(value, multiplier) {
          this.value = isNaN(value)? 0 : value;
          this.multiplier = multiplier;
          Object.defineProperty(this, 'mulValue', {
            get: function() {
              return (parseFloat(this.value) * this.multiplier) +'';
            },
            set: function(n) {
              this.value = parseInt(n) / this.multiplier;
              scope.position = this.value;
            }
          });
        };
        scope.$watch('position', function (n) {
          if(typeof scope.rdh == 'undefined') {
            scope.rdh = new RangeDataHelper(n, parseInt(attr.max) || 100);
          } else {
            // scope.rdh.multiplier = parseInt(attr.max) || 100;
            scope.rdh.value = n;
          }
        });
      }
    }
  }]);

angular.module('vds.utils', [])
  .factory('vdsUtils', function() {
    return {
      time: {
        fromTimeToValue: function (hours, minutes, second, dayConst) {
          var d = new Date(0);
          d.setUTCHours(hours);
          d.setUTCMinutes(minutes);
          d.setUTCSeconds(second);
          return d.getTime() / dayConst;
        },
        fromValueToTime: function (value, dayConst) {
          var d = new Date(dayConst * value);
          return {
            hours: d.getUTCHours() + ( (d.getUTCDate()-1) * 24 ),
            minutes: d.getUTCMinutes(),
            seconds: d.getUTCSeconds()
          };
        }
      },
      format: {
        padZeroes: function (num, size) {
          var s = "000000000" + num;
          return s.substr(s.length-size);
        }
      }
    }
  });
