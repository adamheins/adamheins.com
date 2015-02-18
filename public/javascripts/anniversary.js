// Keeps track of the number of lines of text currently being displayed in the output console.
var lineCount = 0;


/**
 * Generates a random pet name from an internal list.
 *
 * @return {string} A random pet name.
 */
function randomPetName() {
    var petNames = ['punk', 'sweetheart', 'darling', 'babe'];
    return petNames[Math.floor(Math.random() * petNames.length)];
}


/**
 * Generates an appropriate response to a command.
 *
 * @param  {string} command : The command given by the user.
 *
 * @return {string} The response to the user's command.
 */
function processCommand(command) {

    // Commands processed in lowercase.
    command = command.toLowerCase();

    // Special words.
    var words = ['zumba', 'bubble game', 'hundo p', 'cisco'];

    // Love.
    if (command.substring(0, 10) === 'i love you')
        return 'i love you too, ' + randomPetName() + '!';

    // Greeting.
    if (command.substring(0, 2) === 'hi')
        return 'hi, ' + randomPetName() + '!';

    // Request for a hug.
    if (command === 'hug')
        return 'as soon as i see you!';

    // Help with a decision between n things. If no value is specified, assume decision between
    // two options.
    if (command.substring(0, 8) === 'decision') {
        var tokens = command.split(' ');
        if (tokens.length === 1) {
            if (Math.random() * 2 > 1)
                return 'do the second option';
            return 'do the first option';
        }
        var num = parseInt(tokens[1]);
        return 'do option #' + (Math.floor(Math.random() * num) + 1) + '.';
    }

    // Reassurance.
    if (command === 'i cant' || command === "i can't")
        return 'yes you can! i believe in you!';
    if (command === 'help')
        return "it's going to be okay";

    // One of our special words.
    if (words.indexOf(command) !== -1) {
        var index = Math.floor(Math.random() * words.length);
        while (index === words.indexOf(command))
            index = Math.floor(Math.random() * words.length);
        return words[index];
    }

    // Longing.
    if (command.substring(0, 10) === 'i miss you')
        return 'i miss you too, ' + randomPetName() + '!';

    // Empty command.
    if (command === '')
        return 'what please?';

    // Default response when a command was not understood.
    return 'scuse please.';
}


/**
 * DOM manipulation.
 */
$(document).ready(function() {

    // Process command when enter key is pressed.
    $("#entry").on("keydown", function(e) {
        if (e.which === 13 || e.keyCode === 13) {
            e.preventDefault();

            var currentText = $("#textarea").val();
            var command = $("#entry").val();
            $("#entry").val("");

            // Generate a response to the command.
            var response = processCommand(command);

            // Add command and reponse to the console.
            if (command !== '')
                $("#textarea").append("<div class='query'>" + command + "</div>");
            $("#textarea").append("<div class='response'>" + response + "</div>");
            $("#textarea").append("<pre> </pre>");

            // Keep at maximum twenty lines on the screen.
            if (command === '')
                lineCount += 2;
            else
                lineCount += 3;
            while (lineCount > 20) {
                $("#textarea").find(":first-child").remove();
                lineCount--;
            }
        }
    });
});
