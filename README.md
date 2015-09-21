# Annotation Box
Demo page: http://datsat.github.io/Annotating-Box/demo/


Annotation box is an alternative for the traditional HTML input boxes (e.g., text input, text area). It allows users to easily associate their input text with DBpedia (and Wikipedia) resources. It lays the foundation for intelligent search and automatic user-generated content processing in a website's back-end.

##User guide:

1.	You can use the textbox to link words to Wikipedia resources. This helps the reader of your text to get additional information on specific words.
2.	To create links, you can place the cursor at the end of a word as you type and press Ctrl+Space. When a list of suggested resources appears, you can choose an appropriate one which matches the written word. After choosing a resource, a link is established and the color of the word changes to blue.
If no suggestion is relevant, you can use a search engine (e.g., Google) and manually add the link. To close the list, press Escape. 
3.	To link a compound word, select and highlight related words and press Ctrl+Space.
4.	When linking is finished, you can move the mouse over the annotated text to show an information panel containing additional info based on the linked page. You can use the “Remove” button in this panel to detach the created link from your text.


##Developer guide

Resources:
(i) ab.js: JavaScript source code, (ii) ab.css: CSS source code, (iii) example.html: An example to create an annotation box

The annotation box looks and functions similar to the standard HTML text input. However, behind the interface there is a small processor, which allows users to quickly annotate their text. Whenever users wish to create an annotation, they invoke the processor by pressing Ctrl + Space. Next, the processor uses the selected words to generate a query which returns a list of relevant resources to users. Users then select one item from the results to tie their word to the respective resource

To reduce sources of errors, this task is done in an autocomplete manner, i.e., the resource list is updated as soon as users add/remove characters to/from the selected word. Users can remove an annotation, or add a new one by selecting a text (or by placing the text cursor right after a word) and pressing Ctrl + Space

The annotation box is an HTML5 div whose editableContent attribute is set to true. To enforce compatibility with different browsers, we have to deal with a number of technical challenges. For example, when we edit the text and press enter to go to a new line, Firefox will add a br element to the div, while Internet Explorer and Chrome use p and a sub div, respectively. We have to normalize the final HTML content of the box so that it can be consistently saved into the data base. It consists of div elements where each represents a line in the box; each div element contains only of span and a elements for untagged and tagged text, respectively. This structure allows developers to easily extract DBpedia resources from the input content to perform further processing in the back-end. Other non-trivial implementation challenges are: (i) The box processor needs to calculate the correct location of the text cursor in pixels to present the resource list at a reasonable position (i.e., right below the first character of the selected word). (ii) Allowing to replace selected text by the selected link leading to the desired LOD resource
