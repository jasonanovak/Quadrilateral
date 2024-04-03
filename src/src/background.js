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
async function updateWindowPos(command){
  if (debugFlag){
  console.log("command is ", command);
  }

  var currentWindow = await chrome.windows.getCurrent();
  var currentWindowId = currentWindow.id;
  console.log("currentWindowId is ", currentWindowId);

  var tempWindow = await chrome.windows.create({
                                                url:"http://nymag.com",
                                                state: "maximized"});

  const maxWindowHeight = tempWindow.height;
  console.log("maxWindowHeight is ", maxWindowHeight);
  const maxWindowWidth = tempWindow.width;
  console.log("maxWindowWidth is ", maxWindowWidth);
  const maxWindowTop = tempWindow.top;
  console.log("maxWindowTop is ", maxWindowTop);
  const maxWindowLeft = tempWindow.left;
  console.log("maxWindowLeft is ", maxWindowLeft);
  const tempWindowId = tempWindow.id;

  if (true){
    console.log("tempWindow is ", tempWindow);
  }

//  await chrome.windows.remove(tempWindowId);

  /**
   * command is one of the values in the commands array in manifest.json.
   * It specifies the size to resize the window to and what position the
   * window should move to.
   */
  
  if (command == "11-quarters-top-right" ||
      command == "13-quarters-bottom-right" ||
      command == "12-quarters-bottom-left" ||
      command == "10-quarters-top-left"
      ){
    
    /**
     * updateHeight and updateWidth are the new values to resize the
     * window to; they're determined by the command.
     */
    
    updateHeight = parseInt(maxWindowHeight/2);
    updateWidth = parseInt(maxWindowWidth/2);

    if (command == "11-quarters-top-right" ||
        command == "10-quarters-top-left"){
      
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
      
      updateTop = maxWindowTop;
    }
    else if (command == "13-quarters-bottom-right" ||
              command == "12-quarters-bottom-left"){
      updateTop = maxWindowHeight/2;
    }

    if (command == "12-quarters-bottom-left" ||
        command == "10-quarters-top-left"){
      updateLeft = maxWindowLeft;
    }
    else if (command == "11-quarters-top-right" ||
              command == "13-quarters-bottom-right"){
      updateLeft = maxWindowWidth/2;
    }
  }

  if (command == "14-halves-top" ||
      command == "15-halves-bottom" ||
      command == "16-halves-left" ||
      command == "17-halves-right"){
    if (command == "14-halves-top" ||
        command == "15-halves-bottom"){
      updateHeight = parseInt(maxWindowHeight/2);
      updateWidth = maxWindowWidth;
      updateLeft = maxWindowLeft;
      if (command == "14-halves-top"){
        updateTop = maxWindowTop;
      }
      else if (command == "15-halves-bottom"){
        updateTop = parseInt(maxWindowHeight/2);
      }
    }
    else if (command == "16-halves-left" ||
              command == "17-halves-right"){
      updateHeight = maxWindowHeight;
      updateWidth = parseInt(maxWindowWidth/2);
      updateTop = maxWindowTop;
      if (command == "16-halves-left"){
        updateLeft = maxWindowLeft;
      }
      else if (command == "17-halves-right"){
        updateLeft = parseInt(maxWindowWidth/2);
      }
    }
  }

  if (command == "01-third-left" ||
      command == "02-third-center" ||
      command == "03-third-right"){
    updateTop = maxWindowTop;
    updateHeight = maxWindowHeight;
    updateWidth = parseInt(maxWindowWidth/3);
    if (command == "01-third-left"){
      updateLeft = maxWindowLeft;
    }
    else if (command == "02-third-center"){
      updateLeft = parseInt(maxWindowWidth/3);
    }
    else if (command == "03-third-right"){
      updateLeft = parseInt((maxWindowWidth/3)*2);
    }
  }

  if (command == "04-sixth-top-left" ||
      command == "05-sixth-top-center" ||
      command == "06-sixth-top-right" ||
      command == "07-sixth-bottom-left" ||
      command == "08-sixth-bottom-center" ||
      command == "09-sixth-bottom-right"){
    updateHeight = parseInt(maxWindowHeight/2);
    updateWidth = parseInt(maxWindowWidth/3);
    if (command == "04-sixth-top-left" ||
        command == "05-sixth-top-center" ||
        command == "06-sixth-top-right"){
      updateTop = maxWindowTop;
    }
    else if (command == "07-sixth-bottom-left" ||
              command == "08-sixth-bottom-center" ||
              command == "09-sixth-bottom-right"){
      updateTop = parseInt(maxWindowHeight/2);
    }

    if (command == "04-sixth-top-left" ||
        command == "07-sixth-bottom-left"){
        updateLeft = maxWindowLeft;
    }
    else if (command == "05-sixth-top-center" ||
              command == "08-sixth-bottom-center"){
      updateLeft = parseInt(maxWindowWidth/3);
    }
    else if (command == "06-sixth-top-right" ||
              command == "09-sixth-bottom-right"){
      updateLeft = parseInt((maxWindowWidth/3)*2);
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

//  windowUpdate = await chrome.windows.update(currentWindowId, 
//                                             updateInfo);
      

};

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
      url: '/src/readme.html'
    });
  }
  else if (reason === chrome.runtime.OnInstalledReason.UPDATE){
    if (debugFlag){
      console.log("extension installed");
    }
    chrome.tabs.create({
      url: '/src/version_history.html'
    });
  }
});