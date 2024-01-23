// Global variables
var project = app.project;
var patternData, playerData, patternFPS, projectLength, patternLength, fps, videoResolution, noteObject, noteResolution, noteDuration, totalDuration;

// Check project assets for existence of specified item
function verifyExist(itemName) {
    for (var i = 1; i <= project.numItems; i++) {
        var currentItem = project.items[i];
        if (currentItem.name === itemName) {
            return project.items[i];
        }
    }
    return null; // Composition not found in this item
}

// Function to read a file and return its content as a string
function readFile(filePath) {
    var file = new File(filePath);
    if (!file.exists) {
        throw new Error('File not found: ' + file);
    }
    file.open('r');
    var content = file.read();
    file.close();
    return content;
}

// A simple JSON parser
function parseJSON(jsonString) {
    try {
        return eval('(' + jsonString + ')');
    } catch (e) {
        throw new Error('Invalid JSON');
    }
}

// Function to load pattern data from a JSON file
function loadJSONData(fileName) {
    var filePath = new File($.fileName).parent.fullName + '/' + fileName;
    var content = readFile(filePath);
    return parseJSON(content);
}

// Main comp creation
function mainComp() {

    var itemNameToCheck = "Main Comp"; // Replace with the name of the composition you want to check

    // Loop through all items in the project to find the composition
    var mainCompExist = verifyExist(itemNameToCheck);

    // If the loop finishes and no matching composition is found, create the comp
    if (!mainCompExist) {
        project.items.addComp(itemNameToCheck, videoResolution[0], videoResolution[1], 1, totalDuration, fps);
    }
}

// Assemble patterns with supplied note information
function patternBuilder(patternComp, note, instrumentDiagramSize) {
    var noteLayer = patternComp.layers.add(noteObject);
    noteLayer.startTime = note[0] / fps;
    noteLayer.opacity.setValue(note[2] / 6);
    var noteLayerWidth = note[4][0] + (patternComp.width / 2) - (instrumentDiagramSize[0] / 2);
    var noteLayerHeight = note[4][1] + (patternComp.height / 2) - (instrumentDiagramSize[1] / 2);
    noteLayer.position.setValue([noteLayerWidth, noteLayerHeight]);
}

// Create pattern compositions
function patternLayout(patternFolder, layoutKey, instrumentDiagram) {
    var layoutFolder = verifyExist(layoutKey) || project.items.addFolder(layoutKey);
    layoutFolder.parentFolder = patternFolder;
    instrumentDiagram.parentFolder = layoutFolder;
    var instrumentDiagramSize = [instrumentDiagram.width, instrumentDiagram.height];

    for (var patternKey in patternData[layoutKey]) {
        if (patternData[layoutKey].hasOwnProperty(patternKey)) {
            var patternComp = project.items.addComp(patternKey, noteResolution[0], noteResolution[1], 1, noteDuration, patternFPS);
            patternComp.parentFolder = layoutFolder;
            patternComp.layers.add(instrumentDiagram);

            var notesArray = patternData[layoutKey][patternKey];
            if (Array.isArray(notesArray)) {
                for (var i = 0; i < notesArray.length; i++) {
                    patternBuilder(patternComp, notesArray[i], instrumentDiagramSize);
                }
            } else {
                $.writeln('Error: patternData for ' + layoutKey + ' - ' + patternKey + ' is not an array.');
            }
        }
    }
}

// Pattern folder and composition creation process
function patternDirectoryCreator() {
    var patternFolder = verifyExist("Patterns") || project.items.addFolder("Patterns");

    for (var layoutKey in patternData) {
        var footageFile = new File($.fileName).parent.fullName + "/midi_data/visual_layouts/graphics/" + layoutKey + "_layout.ai";
        var instrumentDiagram = verifyExist(footageFile) || project.importFile(new ImportOptions(new File(footageFile)));
        patternLayout(patternFolder, layoutKey, instrumentDiagram);
    }
}

// Recursive function to process patterns
function processPatterns(sectionKey, measureKey, playerKey, player, playerLayout) {
    for (var patternKey in player) {
        if (player.hasOwnProperty(patternKey)) {
            var patternValue = player[patternKey];
            if (patternValue )
            
            // Perform actions on the pattern here
            var pattern = patternData[playerLayout][patternKey]
            // alert("Section: " + sectionKey + ", Measure: " + measureKey + ", Player: " + playerKey + ", Pattern: " + patternKey + ", Value: " + patternValue);
        }
    }
}

// Recursive function to process players
function processPlayers(sectionKey, measureKey, measure) {
    for (var playerKey in measure) {
        if (measure.hasOwnProperty(playerKey)) {
            var player = measure[playerKey];
            
            // Check if the folder for the player already exists
            var folderExists = verifyExist("P" + playerKey);

            // If there is no folder, create it
            if (!folderExists) {
                project.items.addFolder("P" + playerKey);
            }
            
            var playerLayout = playerData[playerKey]['layout'];

            // Process patterns for this player
            processPatterns(sectionKey, measureKey, playerKey, player, playerLayout);
        }
    }
}

// Recursive function to process measures
function processMeasures(sectionKey, section) {
    for (var measureKey in section) {
        if (section.hasOwnProperty(measureKey)) {
            var measure = section[measureKey];
            
            // Perform actions on measures here (if needed)

            // Process players for this measure
            processPlayers(sectionKey, measureKey, measure);
        }
    }
}

function processSections(timelineData) {
    // Iterate over the sections (first-level keys)
    for (var sectionKey in timelineData) {
        if (timelineData.hasOwnProperty(sectionKey)) {
            var section = timelineData[sectionKey];

            // Perform actions on sections here (if needed)

            // Process measures for this section
            processMeasures(sectionKey, section);
        }
    }
}

// Main function
function main() {

    // Import project detail JSON
    var detailPath = new File($.fileName).parent.fullName + '/project_detail.json';
    try {
        var detailContent = readFile(detailPath);
        var detailData = parseJSON(detailContent);
    } catch (e) {
        throw new Error('Error: ' + e.message);
    }

    // Save project details to variables
    var patternFPS = detailData['pattern_fps'];
    var projectLength = detailData['project_length'];
    var patternLength = detailData['pattern_length']
    var fps = detailData['fps'];
    var videoResolution = detailData['video_resolution'];

    // Import timeline JSON
    var timelinePath = new File($.fileName).parent.fullName + '/timeline.json';
    try {
        var timelineContent = readFile(timelinePath);
        var timelineData = parseJSON(timelineContent);
    } catch (e) {
        throw new Error('Error: ' + e.message);
    }

    // Note Object searching from the root of the project
    var itemNameToCheck = prompt("What is the name of your note object?", "");
    var noteObject = verifyExist(itemNameToCheck);

    // If the note object does not exist, throw an error
    if (!noteObject) {
        throw new Error("The note object " + itemNameToCheck + " was not found.");
    }

    // Check if the item is indeed a composition, and if so save the resolution for later use
    if (noteObject instanceof CompItem) {
        var noteResolution = [myComp.width, myComp.height];
    } else {
        throw new Error("\"" + itemNameToCheck + "\" is not a composition.");
    }

    // Grab the duration of the note object
    var noteDuration = noteObject.duration;
    var totalDuration = projectLength + noteDuration;

    // Check for main comp first, create it if it doesn't exist
    mainComp(videoResolution, totalDuration, fps);

    // Create pattern folder and compositions
    patternDirectoryCreator(noteResolution, patternLength, patternFPS);

    //Begin construction of note-based compositions
    processSections(timelineData);

}

main();