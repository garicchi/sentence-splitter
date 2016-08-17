'use babel';

import SentenceSplitterView from './sentence-splitter-view';
import { CompositeDisposable } from 'atom';

export default {

  sentenceSplitterView: null,
  modalPanel: null,
  subscriptions: null,
  config:{
    "enable-whiteline":{
      type:'boolean',
      default:true
    }
  },

  activate(state) {
    this.sentenceSplitterView = new SentenceSplitterView(state.sentenceSplitterViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sentenceSplitterView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sentence-splitter:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.sentenceSplitterView.destroy();
  },

  serialize() {
    return {
      sentenceSplitterViewState: this.sentenceSplitterView.serialize()
    };
  },

  toggle() {

    var isWhilteLine = atom.config.get('enable-whiteline');
    splitOneLine(isWhilteLine);

  }

};

//```enから```までの間のテキストを「.」で改行+空行を入れ込む関数
function splitOneLine(isWhiteLineAdd){
  var editor = atom.workspace.getActiveTextEditor();
  var lines = editor.buffer.lines;
  var active = false;
  var newLines = Array();
  for(var i = 0;i<lines.length;i++){
    var line = lines[i];
    if(line.indexOf('```') !== -1 && lines.indexOf('```en') === -1){
      active = false;
    }
    if(active){
      var currentLine = '';
      for(var j = 0;j<line.length;j++){
        currentLine += line[j]
        var insertNewLine = false;
        if(line[j] === '.'){
          if((line.length-1) >= (j+1)){
            if(line[j+1] !== '\n'){
              insertNewLine = true;
            }else{
              insertNewLine = false;
            }

          }
        }

        if(insertNewLine){
          currentLine+='\n';
          if(isWhiteLineAdd){
            currentLine+='\n'
          }
        }
      }
      if(isWhiteLineAdd){
        if((lines.length-1)>=(i+1)){
          if(lines[i] !=='' && lines[i+1] !== ''){
            currentLine+='\n'
          }
        }
      }
      currentLine = currentLine.split('\n ').join('\n');
      newLines.push(currentLine);
    }else{
      newLines.push(line);
    }

    if(line.indexOf('```en') !== -1){
      active = true;
    }
  }
  editor.setText(newLines.join('\n'));
  editor.save();
}
