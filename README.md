# Annotating-Box
Annotating box is a replacement of the traditional HTML input boxes (e.g., text input, text area). It allows users to easily associate their input text with DBpedia resources.

Resources:
(i) ab.js: JavaScript source code, (ii) ab.css: CSS source code, (iii) example.html: An example show how to create an annotating box

Annotating box looks and functions similarly to the standard HTML text input. However, behind the box interface is a small processor, which allows users to quickly annotate their text. Whenever they confident that the typed words are ambiguous and need to be annotated, they invoke the processor by pressing Ctrl + Space. Next, the box processor takes the selected words to generate a query to LOD cloud and returns a list of relevant resources to users.

To reduce sources of errors, this task is done in an auto complete manner, i.e., the resource list is updated as so on as us ers add/rem ove a character to/from the selected word. Users can remove an annotation, or add a new one by selecting a text (or by placing the text cursor right after a word) and pressing Ctrl + Space.

The box is a HTML5 DIV whose editableContent attribute is true. To enforce compatibility with various types of browsers, we have to deal with a number of technical challenges. For example, when we edit the text and press enter to go to a new line, Firefox will add a BR element to the DIV, while Internet Explorer and Chrome use P and a sub DIV, respectively. We have to normalize the final HTML source code so that it can be consistently saved into the data base. It comprises of DIV elements in which each represents a line; each DIV element contains only SPAN and A elements for the untagged and tagged text, respectively. Other nontrivial implementation challenges are: (i) The box processor needs to calculate the coordination of the text cursor (or caret) in pixels to place the resource list in a reasonable position (i.e., right below the first character of the selected word). (ii) It is able to replace selected text by the selected link to the LOD resource.
