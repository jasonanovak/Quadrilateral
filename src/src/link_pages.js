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

document.addEventListener('DOMContentLoaded', function() {
//    document.getElementById('extensionsShortcutLink').addEventListener('click', function() {
//        chrome.tabs.create({ url: 'chrome://extensions/shortcuts',
//                             active: true });
//    });

    var el = document.getElementById('extensionsShortcutLink');
    if (el) {
        el.addEventListener('click',  function() {
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts',
                                 active: true });
        })
    }

    el = document.getElementById('extensionsDetailsLink');

    if (el) {
        el.addEventListener('click',  function() {
            chrome.tabs.create({ url: 'chrome://extensions/?id=pmjgofekhmioiablnjgickcmgaoklioh',
                                 active: true });
        })
    }


//    document.getElementById('extensionsDetailsLink').addEventListener('click', function() {
//        chrome.tabs.create({ url: 'chrome://extensions/?id=pmjgofekhmioiablnjgickcmgaoklioh',
//                             active: true });
//    });
});