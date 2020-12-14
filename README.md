# Ionic Angular $tudent Expen$e$ Application

Code Once, Have Every Where(Web, Mobile, Refrigerator, etc.!)
Probably the best framework ever.

Angular 11 , Node v14LTS

This app is built from Ionic Starter App (Conference app), for the tabs, and Basic Look and Feel (BLAF).
A good test to see if your ready to have a go at running this is if your able to run the starter app 
provided by Ionic in the Cli.  If your able to get that up no problem, you shouldnt have any issues
running this app either, as I have NOT added any major packages to it.

App is essentially, or going to be a full blown Expense Report's app, with the latest MEAN stack built on top of Ionic.

If you do decide to fork, please update the mongoDB connection string in the server/config.
You can point to a local instance or any other instance, first account created is always an Admin.

This apps is still in early development.

## <u>Table Of Contents</u>:
1. <a href="#for-ql-student-expenses-runners">Instructions for Running</a>
2. <a href="#deploying">Instructions for Deploying</a>
3. <a href="#bugs-tracker--features-todo">TODO'S & Bugs</a>
   
*** The <a href="https://ionicframework.com/docs/cli">Ionic CLI</a> is NOT needed to run this application, `npm start` works, but CLI is recommended.
<br/>*** Angular is required <a href="https://cli.angular.io/">Angular CLI</a>

## For QL Student Expenses Runners  

<a href="https://github.com/mikecrf121/ql-student-expenses-ionic/issues/11">More info to get this running before bellow steps HERE.</a>

1. cd into server and `npm Install`
2. `npm start` to start server (should say running "Server listening on port 4000" ).
3. Open a new terminal window...
4. cd into client
5. run `npm i`
6. run `ionic serve` (will open up a page in browser) or `npm start` .<br/>
**** `ionic serve --external`<---<a href="https://ionicframework.com/docs/cli/commands/serve">This is really cool.</a> 
7. Home Page has more instructions and overview.

* You should have 2 terminals running, one for the server, and one for the client.


## Deploying

### Progressive Web App

1. Un-comment [these lines](https://github.com/ionic-team/ionic2-app-base/blob/master/src/index.html#L21)
2. Run `npm run ionic:build --prod`
3. Push the `www` folder to your hosting service

### Android

1. Run `ionic cordova run android --prod`

### iOS

1. Run `ionic cordova run ios --prod`

# Bugs Tracker / Features TODO

## TODO

<a href="https://github.com/mikecrf121/ql-student-expenses-ionic/labels/enhancement">All Of Student Expenses TODO's & Enhancements<a>

## Bugs

<a href="https://github.com/mikecrf121/ql-student-expenses-ionic/labels/bug">All Of Student Expenses Bug's<a>

## Future Milestones

<a href="https://github.com/mikecrf121/ql-student-expenses-ionic/issues/14">Future Releases</a>



