# ng2Scrollster

A lightweight, customizable scroll-bar component built for use with Angular2 projects.

Installation
-

#### Installation with `NPM` 

    npm install ng2-scrollster
    
#### SystemJS configuration:

      var maps = {
        ...
        'ng2-scrollster' : 'node_modules/ng2-scrollster'
      };
      
      var packages = {
        ...
        'ng2-scrollster' : { main: 'index.js', defaultExtension: 'js' }
      };
    
    
Usage
-

To make your content scrollable, supply the `NgScrollster` component into your view as such:

    import {Ng2Scrollster} from 'ng2-scrollster'
    
    @Component({
      ...
      templateUrl: 'your.template.html',
      directives: [Ng2Scrollster]
    })
    
And, just add `ng-scrollster` as an attribute to the container element.

    <div ng-scrollster class="content">
        <!-- Your Content -->
    </div>
    
Yep! simple as that.

Scrollbar Customization
-

If you want to get your hands dirty with the bars' CSS, use the `barOptions` property to bind an object with any valid CSS properties to the scrollbar component.

    <div ng-scrollster [barOptions]="{ backgroundColor: 'lightcoral' }">
        <!-- Your Content -->
    </div>

License
-

MIT
