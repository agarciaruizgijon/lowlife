import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

platformBrowser().bootstrapModule(AppModule, {
  
})
  .then(() => console.log('App bootstrapped'))
  .catch(err => console.error(err));
