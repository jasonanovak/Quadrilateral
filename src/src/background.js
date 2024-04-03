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

const debugFlag = true;

function displayCompare(a, b){
  if (a.workArea.left > b.workArea.left){
    return 1;
  } else if (a.workArea.left < b.workArea.left){
    return -1;
  }
  return 0
}

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
  console.log(command);
  currentWindow = await chrome.windows.getCurrent();
  if (debugFlag){
    console.log("currentWindow is ", currentWindow);
  }
  displayInfo = await chrome.system.display.getInfo();
  if (debugFlag){
    console.log("displayInfo is ", displayInfo);
  }

  if (debugFlag){
    console.log("currentWindow.left is ", currentWindow.left);
  }


  // To calculate what display you're on, loop at where the left coordinate
  // of the window is.
  
  // Create bounding boxes, figure out which bounding box the window is in
  // move the window in that bounding box, including offset

  displayInfo.sort(displayCompare);

  var displayInfoCount = 0;

  var leftOffset = 0;

  for (oneDisplayInfo of displayInfo){
    console.log("oneDisplayInfo.workArea.left is ", oneDisplayInfo.workArea.left);
    console.log("oneDisplayInfo.workArea.width is ", oneDisplayInfo.workArea.width);

    if (currentWindow.left >= oneDisplayInfo.workArea.left &&
        currentWindow.left < (oneDisplayInfo.workArea.left + 
                              oneDisplayInfo.workArea.width)){
      console.log("Breaking on display ", oneDisplayInfo);
      break
    }
    console.log("Adding ", oneDisplayInfo);
    displayInfoCount += 1;
    leftOffset += oneDisplayInfo.workArea.width;
  }

  console.log("leftOffset is ", leftOffset);
  console.log("displayInfoCount is ", displayInfoCount);

  console.log(displayInfo);

  const height = displayInfo[displayInfoCount].workArea.height;
  const width = displayInfo[displayInfoCount].workArea.width;

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
    
    updateHeight = parseInt(height/2);
    updateWidth = parseInt(width/2);

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
      
      updateTop = displayInfo[displayInfoCount].workArea.top;
    }
    else if (command == "13-quarters-bottom-right" ||
              command == "12-quarters-bottom-left"){
      updateTop = displayInfo[displayInfoCount].workArea.height/2;
    }

    if (command == "12-quarters-bottom-left" ||
        command == "10-quarters-top-left"){
      updateLeft = displayInfo[displayInfoCount].workArea.left;
    }
    else if (command == "11-quarters-top-right" ||
              command == "13-quarters-bottom-right"){
      updateLeft = displayInfo[displayInfoCount].workArea.left+
                   displayInfo[displayInfoCount].workArea.width/2;
    }
  }

  if (command == "14-halves-top" ||
      command == "15-halves-bottom" ||
      command == "16-halves-left" ||
      command == "17-halves-right"){
    if (command == "14-halves-top" ||
        command == "15-halves-bottom"){
      updateHeight = parseInt(height/2);
      updateWidth = width;
      updateLeft = displayInfo[displayInfoCount].workArea.left;
      if (command == "14-halves-top"){
        updateTop = displayInfo[displayInfoCount].workArea.top;
      }
      else if (command == "15-halves-bottom"){
        updateTop = parseInt(height/2);
      }
    }
    else if (command == "16-halves-left" ||
              command == "17-halves-right"){
      updateHeight = height;
      updateWidth = parseInt(width/2);
      updateTop = displayInfo[displayInfoCount].workArea.top;
      if (command == "16-halves-left"){
        updateLeft = displayInfo[displayInfoCount].workArea.left;
      }
      else if (command == "17-halves-right"){
        updateLeft = parseInt(width/2);
      }
    }
  }

  if (command == "01-third-left" ||
      command == "02-third-center" ||
      command == "03-third-right"){
    updateTop = displayInfo[displayInfoCount].workArea.top;
    updateHeight = height;
    updateWidth = parseInt(width/3);
    if (command == "01-third-left"){
      updateLeft = displayInfo[displayInfoCount].workArea.left;
    }
    else if (command == "02-third-center"){
      updateLeft = displayInfo[displayInfoCount].workArea.left +
                   parseInt(width/3);
    }
    else if (command == "03-third-right"){
      updateLeft = displayInfo[displayInfoCount].workArea.left +
                   parseInt((width/3)*2);
    }
  }

  if (command == "04-sixth-top-left" ||
      command == "05-sixth-top-center" ||
      command == "06-sixth-top-right" ||
      command == "07-sixth-bottom-left" ||
      command == "08-sixth-bottom-center" ||
      command == "09-sixth-bottom-right"){
    updateHeight = parseInt(height/2);
    updateWidth = parseInt(width/3);
    if (command == "04-sixth-top-left" ||
        command == "05-sixth-top-center" ||
        command == "06-sixth-top-right"){
      updateTop = displayInfo[displayInfoCount].workArea.top;
    }
    else if (command == "07-sixth-bottom-left" ||
              command == "08-sixth-bottom-center" ||
              command == "09-sixth-bottom-right"){
      updateTop = parseInt(height/2);
    }

    if (command == "04-sixth-top-left" ||
        command == "07-sixth-bottom-left"){
        updateLeft = displayInfo[displayInfoCount].workArea.left;
    }
    else if (command == "05-sixth-top-center" ||
              command == "08-sixth-bottom-center"){
      updateLeft = displayInfo[displayInfoCount].workArea.left + 
                   parseInt(width/3);
    }
    else if (command == "06-sixth-top-right" ||
              command == "09-sixth-bottom-right"){
      updateLeft = displayInfo[displayInfoCount].workArea.left + 
                   parseInt((width/3)*2);
    }
  }
  
//  updateLeft += leftOffset; 

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
  
  await chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT,
                                                  updateInfo);
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