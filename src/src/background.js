// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const debugFlag = false;

/**
 * @fileoverview background service worker that does the window resize and
 * movement.
 */

/**
 * Get the current window.
 * Resize it to 1/6, 1/4, 1/3, or 1/2 of the screen's size.
 * Move it to the user specified part of the screen.
 * 
 * @param command The command sent by the user to resize and move the window.
 */
function updateWindowPos(command){
  console.log(command);
  currentWindow = chrome.windows.getCurrent();
  currentWindow.then(currentWindowResolve => {
    if (debugFlag){
      console.log("currentWindowResolve is ", currentWindowResolve);
    }
    displayInfo = chrome.system.display.getInfo();
    displayInfo.then(displayInfoResolve => {
      if (debugFlag){
        console.log("displayInfoResolve is ", displayInfoResolve);
      }
      /**
       * height and width are the height and width of the display the current
       * window is on.
       * 
       * They're used to calculate the new window size.
       * 
       * workArea is used because it is "The usable work area of the display 
       * within the display bounds. The work area excludes areas of the 
       * display reserved for OS, for example taskbar and launcher." per 
       * https://developer.chrome.com/docs/extensions/reference/api/system/display#:~:text=physical%20tablet%20state.-,workArea,-Bounds
       */
      
      let height = displayInfoResolve[0].workArea.height;
      let width = displayInfoResolve[0].workArea.width;

      /**
       * command is one of the values in the commands array in manifest.json.
       * It specifies the size to resize the window to and what position the
       * window should move to.
       */
      
      if (command == "10-quarters-01" ||
          command == "11-quarters-02" ||
          command == "12-quarters-03" ||
          command == "13-quarters-04"
          ){
        
        /**
         * updateHeight and updateWidth are the new values to resize the
         * window to; they're determined by the command.
         */
        
        updateHeight = parseInt(height/2);
        updateWidth = parseInt(width/2);

        if (command == "10-quarters-01" ||
            command == "13-quarters-04"){
          
          /**
           * updateTop is the distance from the top of the screen to move the
           * window to.
           * 
           * updateLeft is the distance from the left hand side of the screen
           * to move the window to.
           * 
           * The top left corner is 0,0.
           * 
           * These are calculated on whether the window should be  1/6, 1/4, 
           * 1/3, or 1/2 of the screen's size.
           */
          
          updateTop = displayInfoResolve[0].workArea.top;
        }
        else if (command == "11-quarters-02" ||
                 command == "12-quarters-03"){
          updateTop = displayInfoResolve[0].workArea.height/2;
        }

        if (command == "12-quarters-03" ||
            command == "13-quarters-04"){
          updateLeft = displayInfoResolve[0].workArea.left;
        }
        else if (command == "10-quarters-01" ||
                 command == "11-quarters-02"){
          updateLeft = displayInfoResolve[0].workArea.width/2;
        }
      }

      if (command == "14-halves-01" ||
          command == "15-halves-02" ||
          command == "16-halves-03" ||
          command == "17-halves-04"){
        if (command == "14-halves-01" ||
            command == "15-halves-02"){
          updateHeight = parseInt(height/2);
          updateWidth = width;
          updateLeft = displayInfoResolve[0].workArea.left;
          if (command == "14-halves-01"){
            updateTop = displayInfoResolve[0].workArea.top;
          }
          else if (command == "15-halves-02"){
            updateTop = parseInt(height/2);
          }
        }
        else if (command == "16-halves-03" ||
                 command == "17-halves-04"){
          updateHeight = height;
          updateWidth = parseInt(width/2);
          updateTop = displayInfoResolve[0].workArea.top;
          if (command == "16-halves-03"){
            updateLeft = displayInfoResolve[0].workArea.left;
          }
          else if (command == "17-halves-04"){
            updateLeft = parseInt(width/2);
          }
        }
      }

      if (command == "01-thirds-01" ||
          command == "02-thirds-02" ||
          command == "03-thirds-03"){
        updateTop = displayInfoResolve[0].workArea.top;
        updateHeight = height;
        updateWidth = parseInt(width/3);
        if (command == "01-thirds-01"){
          updateLeft = displayInfoResolve[0].workArea.left;
        }
        else if (command == "02-thirds-02"){
          updateLeft = parseInt(width/3);
        }
        else if (command == "03-thirds-03"){
          updateLeft = parseInt((width/3)*2);
        }
      }

      if (command == "04-sixths-01" ||
          command == "05-sixths-02" ||
          command == "06-sixths-03" ||
          command == "07-sixths-04" ||
          command == "08-sixths-05" ||
          command == "09-sixths-06"){
        updateHeight = parseInt(height/2);
        updateWidth = parseInt(width/3);
        if (command == "04-sixths-01" ||
            command == "05-sixths-02" ||
            command == "06-sixths-03"){
          updateTop = displayInfoResolve[0].workArea.top;
        }
        else if (command == "07-sixths-04" ||
                 command == "08-sixths-05" ||
                 command == "09-sixths-06"){
          updateTop = parseInt(height/2);
        }

        if (command == "04-sixths-01" ||
            command == "07-sixths-04"){
           updateLeft = displayInfoResolve[0].workArea.left;
        }
        else if (command == "05-sixths-02" ||
                 command == "08-sixths-05"){
          updateLeft = parseInt(width/3);
        }
        else if (command == "06-sixths-03" ||
                 command == "09-sixths-06"){
          updateLeft = parseInt((width/3)*2);
        }
      }
      
      /**
       * updateInfo is the dictionary that specifies the new size and location
       * of the window.
       */

      let updateInfo = {"height": updateHeight,
                        "width": updateWidth,
                        "top": updateTop,
                        "left": updateLeft,
                        "state": "normal",
                        "drawAttention": false};
      if (debugFlag){
        console.log("updating to ", command, " ", updateInfo);
      }
      /**
       * Create the promise to resize and move the window and then execute.
       */
      
      windowUpdatePromise = chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT,
                                                  updateInfo);
      windowUpdatePromise.then();

    });
  });
}


/**
 * This listens for the command sent by the user via keyboard shortcut.
 */
chrome.commands.onCommand.addListener((command) => {
  updateWindowPos(command);
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    if (debugFlag){
      console.log("extension installed");
    }
    chrome.tabs.create({
      url: '/src/instructions.html'
    });
  }
});