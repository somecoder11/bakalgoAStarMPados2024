function GrayCodes() {
  this.active = false;

  // Input limits
  var minStringLength = 1;
  var maxStringLength = 16;

  // GUI Element references, initialised in initialize()
  var input_field;
  var input_length;

  var input_label1;
  var output_label1;
  var input_content1;
  var output_content1;
  var input_spans1 = [];
  var output_spans1 = [];
  var output_internal1 = "";

  var input_label2;
  var output_label2;
  var input_content2;
  var output_content2;
  var input_spans2 = [];
  var output_spans2 = [];
  var output_internal2 = "";
  var input_indicator;

  // Settings for runspeed slider
  var exec_interval = 100; //ms
  var speed = 5;

  // Translation Direction
  var BIN_TO_GRAY = 0;
  var GRAY_TO_BIN = 1;
  var translation_direction = BIN_TO_GRAY;

  // Presuccessor Direction
  var PREDECESSOR = 0;
  var SUCCESSOR = 1;
  var presuccessor_direction = SUCCESSOR;

  // Current mode
  var TRANSLATION = 0;
  var PRESUCCESSOR = 1;
  var currentMode = TRANSLATION;


  // Step counters
  var k_translation = 0;
  var k_presuccessor = 0;
  var stepCountTranslation = 0;
  var stepCountPreSucccessor = 0;


  // Translation animation related variables
  var FINISHEDTRANSLATION = false;
  var FINISHEDPRESUCCESSOR = false;
  var ISPAUSED = true;
  var translation_anim_pending = FIRST;
  var FIRST = 0;
  var SHIFT_ORANGE = 1;
  var REMOVE_OUTPUT_COLOR = 2;
  var END = 3;
  var NONE = 999;


  // Presuccessor Animation related variables
  var COPY_INPUT_TO_OUTPUT = 0;
  var HIGHLIGHT_ONES = 1;
  var DISPLAY_PARITY = 2
  var HIGHLIGHT_INPUT_FLIP = 3;
  var LOCK_IN_BIT = 4;
  var LOCK_IN_OUTPUT = 5;
  var FINISH = 6;
  var presuccessor_anim_pending = NONE;

  var redraw_presuccessor = false;
  var presuccessor_flipped_bit = 0;
  var number_of_ones = 0;

  var canvas;
  var ctx;

  this.initialize = function () {
    input_label1 = document.getElementById("input-label1");
    output_label1 = document.getElementById("output-label1");
    input_content1 = document.getElementById("input-content1");
    output_content1 = document.getElementById("output-content1");

    input_label2 = document.getElementById("input-label2");
    output_label2 = document.getElementById("output-label2");
    input_content2 = document.getElementById("input-content2");
    output_content2 = document.getElementById("output-content2");
    input_indicator = document.getElementById("input-indicator");

    input_label1.innerHTML = "Binary Code: ";
    output_label1.innerHTML = "Gray Code: ";

    input_label2.innerHTML = "G[i]:";
    output_label2.innerHTML = "G[i+1]:";

    input_field = document.getElementById("inputfield");

    content_div = document.getElementById("content");
    info_div = document.getElementById("info");
    algo_div = document.getElementById("algo");
    selection_div = document.getElementById("main-window");

    document.getElementById("input").setAttribute("maxlength", maxStringLength);
  };

  this.drawTranslationArrow = function (position, mode, translation_dir) {
    canvas = document.getElementById("canvas1");
    if (canvas.getContext) {
      ctx = canvas.getContext("2d");


      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.canvas.width = input_label1.offsetWidth + input_content1.offsetWidth + 50;

      // if mode is clearing, return
      if (mode == 2) {
        return;
      }

      var hor_offset = 180;
      var start_x = hor_offset + position * 24.67; // x coordinate
      var start_y = 0; // y coordinate
      var radius = 13; // Arc radius
      var line_length = 13; // length of the straight lines above and below the curve of left arrow
      var arrow_tip_width = 4; // width of the arrow tip
      var arrow_tip_height = 10; // height of the arrow tip

      // if mode is straight arrow
      if (mode == 1) {
        //straight line
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x, start_y = start_y + 2 * (radius + line_length));
        ctx.stroke();
        ctx.closePath();

        // arrow tip
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x = start_x - arrow_tip_width, start_y = start_y - arrow_tip_height);
        ctx.lineTo(start_x = start_x + 2 * arrow_tip_width, start_y);
        ctx.fill();
        ctx.closePath();

        // XOR text
        ctx.fillText("COPY", start_x + 5, start_y - 20)
        return;
      }

      // when mode is double arrow

      if (translation_dir == 0) {
        // left arrow line
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x, start_y = start_y + line_length);
        ctx.arc(start_x = start_x + radius, start_y, radius, Math.PI, 0.5 * Math.PI, 1);
        ctx.arc(start_x, start_y = start_y + 2 * radius, radius, 1.5 * Math.PI, 0, 0);
        ctx.lineTo(start_x = start_x + radius, start_y = start_y + line_length);
        ctx.stroke();
        ctx.closePath();

        // arrow tip
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x = start_x - arrow_tip_width, start_y = start_y - arrow_tip_height);
        ctx.lineTo(start_x = start_x + 2 * arrow_tip_width, start_y);
        ctx.fill();
        ctx.closePath();
      }
      else if (translation_dir == 1) {
        ctx.beginPath();
        ctx.moveTo(start_x, start_y = start_y + 2 * (radius + line_length))
        ctx.lineTo(start_x, start_y = start_y - line_length);
        ctx.arc(start_x = start_x + radius, start_y, radius, Math.PI, 2 * Math.PI, 0);
        ctx.stroke();
        ctx.closePath();

        // arrow tip
        ctx.beginPath();
        ctx.moveTo(start_x = start_x + radius, start_y = start_y + line_length);
        ctx.lineTo(start_x = start_x - arrow_tip_width, start_y = start_y - arrow_tip_height);
        ctx.lineTo(start_x = start_x + 2 * arrow_tip_width, start_y);
        ctx.fill();
        ctx.closePath();
      }

      // right arrow line
      ctx.beginPath();
      ctx.moveTo(start_x = start_x - arrow_tip_width, start_y = start_y + arrow_tip_height);
      ctx.lineTo(start_x, start_y = start_y - 2 * (radius + line_length));
      ctx.stroke();

      // XOR text
      ctx.fillText("XOR", start_x + 5, start_y + 20)

    }
  };

  this.drawPreSuccessorArrow = function (position, mode, parity_arrow) {
    canvas = document.getElementById("canvas2");
    if (canvas.getContext) {
      ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.canvas.width = input_label2.offsetWidth + input_content2.offsetWidth + input_indicator.offsetWidth;

      // if mode is clearing, return
      if (mode == 2) {
        return;
      }

      var hor_offset = 180;
      var span_width = 24.67;
      var start_x = hor_offset + position * span_width; // x coordinate
      var start_y = 0; // y coordinate
      var radius = 13; // Arc radius
      var line_length = 13; // length of the straight lines above and below the curve of left arrow
      var arrow_tip_width = 4; // width of the arrow tip
      var arrow_tip_height = 10; // height of the arrow tip

      if (mode == 1) { // even parity, straight arrow
        //straight line
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x, start_y = start_y + 2 * (radius + line_length));
        ctx.stroke();
        ctx.closePath();

        // arrow tip
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x = start_x - arrow_tip_width, start_y = start_y - arrow_tip_height);
        ctx.lineTo(start_x = start_x + 2 * arrow_tip_width, start_y);
        ctx.fill();
        ctx.closePath();
      }

      if (mode == 0) { // odd parity
        //straight line
        ctx.beginPath();
        ctx.moveTo(start_x = start_x + span_width, start_y);
        ctx.lineTo(start_x = start_x - 0.8 * span_width, start_y = start_y + 2 * (radius + line_length));
        ctx.stroke();
        ctx.closePath();

        // arrow tip
        var hyp = Math.sqrt(Math.pow(arrow_tip_height, 2) + Math.pow(arrow_tip_width, 2));
        var alpha = Math.pow(Math.tan(52 / span_width), -1);
        var new_height = hyp * Math.cos(alpha);
        var new_width = Math.abs(hyp * Math.sin(alpha));

        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x = start_x, start_y = start_y - new_height);
        ctx.lineTo(start_x = start_x + (2 * arrow_tip_width * Math.cos(alpha)), start_y = start_y - (2 * arrow_tip_width * Math.sin(alpha)));
        ctx.fill();
        ctx.closePath();
      }

      ctx.fillText("FLIP", start_x - 35, start_y - 15);

      // parity arrow
      var offset = input_label2.offsetWidth + input_content2.offsetWidth + input_indicator.offsetWidth - 50;
      ctx.setLineDash([5, 3])
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset, 30);
      ctx.lineTo(start_x + 15, 30);
      ctx.stroke();
      ctx.setLineDash([])
      ctx.closePath();

      // arrow tip
      ctx.beginPath();
      ctx.moveTo(start_x = start_x + 15, start_y = 30);
      ctx.lineTo(start_x = start_x + arrow_tip_height, start_y = start_y - arrow_tip_width);
      ctx.lineTo(start_x = start_x, start_y + 2 * arrow_tip_width);
      ctx.fill();
      ctx.closePath();


        
    }
  };

  this.changeMode = function (button) {
    if (button.classList.contains("selection-button-activated") == false) {
      document.getElementById("btn1").classList.remove("selection-button-activated");
      document.getElementById("btn2").classList.remove("selection-button-activated");
      button.classList.add("selection-button-activated");

      if (button.id == "btn1") {
        document.getElementById("content2").style.display = "none";
        document.getElementById("content1").style.display = "block";
        currentMode = TRANSLATION;
      } else if (button.id == "btn2") {
        document.getElementById("content1").style.display = "none";
        document.getElementById("content2").style.display = "block";
        currentMode = PRESUCCESSOR;
      }
    }
  };

  this.restrictKeyPress = function (event) {
    var key = String.fromCharCode(event.keyCode);
    if (key.replace(/[^0-1]/g, "") === "") {
      event.preventDefault();
    }
  };

  this.updateInputContent = function () {
    this.goToBeginning();
    input_length = input_field.value.length;

    if (!this.validateAndUpdate(input_field)) return;

    // delete all spans
    while (input_spans1.length > 0) {
      if (input_content1.contains(input_spans1[0])) input_content1.removeChild(input_spans1[0]);
      if (input_content2.contains(input_spans2[0])) input_content2.removeChild(input_spans2[0]);
      input_spans1.shift();
      input_spans2.shift();
    }

    // enter new spans
    for (i = 0; i < input_length; i++) {
      const new_span1 = document.createElement("span");
      const new_span2 = document.createElement("span");

      input_content1.appendChild(new_span1);
      new_span1.innerText = input_field.value[i];
      input_spans1.push(new_span1);
      input_content2.appendChild(new_span2);
      new_span2.innerText = input_field.value[i];
      input_spans2.push(new_span2);
    }
  };

  this.changeDirection = function () {
    this.goToBeginning();

    if (currentMode == TRANSLATION) {
      if (translation_direction == BIN_TO_GRAY) {
        translation_direction = GRAY_TO_BIN;
        input_label1.innerHTML = "Gray Code: ";
        output_label1.innerHTML = "Binary Code: ";
      }
      else {
        translation_direction = BIN_TO_GRAY;
        input_label1.innerHTML = "Binary Code: ";
        output_label1.innerHTML = "Gray Code: ";
      }
    }
    else if (currentMode == PRESUCCESSOR) {
      if (presuccessor_direction == SUCCESSOR) {
        presuccessor_direction = PREDECESSOR;
        output_label2.innerHTML = "G[i-1]:";
      }
      else {
        presuccessor_direction = SUCCESSOR;
        output_label2.innerHTML = "G[i+1]:";
      }
    }
  };

  this.generateRandomBinary = function () {
    var binaryNumber = "";
    var min = 4;
    var max = 12;
    var binaryLength = Math.random() * (max - min) + min;

    for (var i = 0; i < binaryLength; i++) {
      var bit = Math.floor(Math.random() * 2); // Generate either 0 or 1
      binaryNumber += bit.toString();
    }

    return binaryNumber;
  };

  this.randomNumber = function () {
    var binaryNumber = this.generateRandomBinary();

    // Update the input element value with the generated binary number
    input_field.value = binaryNumber;
    this.updateInputContent();
    this.goToBeginning();
  };


  this.xor = function (x, y) {
    return (x == y) ? '0' : '1';
  };

  this.grayToBinary = function (gray_value) {
    var binary_value = "";
    binary_value += gray_value[0];
    for (var i = 1; i < gray_value.length; i++) {
      if (gray_value[i] == '0')
        binary_value += binary_value[i - 1];
      else
        binary_value += (binary_value[i - 1] == '0') ? '1' : '0';
    }

    return binary_value;
  };

  this.binaryToGray = function (binary_value) {
    var gray_value = "";
    gray_value += binary_value[0];
    for (var i = 1; i < binary_value.length; i++) {
      gray_value += this.xor(binary_value[i - 1], binary_value[i]);
    }

    return gray_value;
  };

  this.incrementInput = function () {
    var input, leading_zeros, dec_input;
    input = document.getElementById("inputfield").value;
    if ((currentMode == TRANSLATION && translation_direction == BIN_TO_GRAY)) {

      if (input == "") {
        leading_zeros = 0;
        dec_input = parseInt(0, 2);
      }
      else {
        leading_zeros = input.match(/^0*/)[0].length;
        dec_input = parseInt(input, 2);
      }

      dec_input++;

      var new_value = dec_input.toString(2);
    }
    else { //input is a gray code, so the input has to be converted before and after incrementation
      if (input == "") {
        leading_zeros = 0;
        dec_input = parseInt(0, 2);
      }
      else {
        leading_zeros = input.match(/^0*/)[0].length;
        dec_input = parseInt(this.grayToBinary(input), 2);
      }

      dec_input++;
      var new_value = this.binaryToGray(dec_input.toString(2));
    }

    if (leading_zeros && (("0".repeat(leading_zeros) + new_value).length > input.length)) leading_zeros--; // so the new value is the same length even when the actual number without leading zeroes became longer, also only make this when we have leading zeros, so leading zeros does not become negative
    if (new_value.length <= maxStringLength) document.getElementById("inputfield").value = "0".repeat(leading_zeros) + new_value;

    this.updateInputContent();
    this.goToBeginning();
  };


  this.decrementInput = function () {
    if (input_field.value == "") {
      return;
    }
    else {
      var input = document.getElementById("inputfield").value;
      var leading_zeros = input.match(/^0*/)[0].length;

      if ((currentMode == TRANSLATION && translation_direction == BIN_TO_GRAY)) {

        var dec_input = parseInt(input, 2);
        dec_input--;

        var new_value = dec_input.toString(2);
      }
      else {
        var dec_input = parseInt(this.grayToBinary(input), 2);
        dec_input--;

        var new_value = this.binaryToGray(dec_input.toString(2));
      }

      if (("0".repeat(leading_zeros) + new_value).length < input.length) leading_zeros++; // so the new value is the same length even when the actual number without leading zeroes became longer, also only make this when we have leading zeros, so leading zeros does not become negative
      if (new_value >= 0) document.getElementById("inputfield").value = "0".repeat(leading_zeros) + new_value;

      this.updateInputContent();
      this.goToBeginning();
    }
  };

  this.validateAndUpdate = function (textbox) {
    old_value = textbox.value;
    textbox.value = textbox.value.replace(/[^0-1]/g, "");
    var string = textbox.value;

    if (string.length > maxStringLength) {
      textbox.value = textbox.value.substring(0, maxStringLength);
    }

    return textbox.value == old_value;
  };

  this.onPaste = function (textbox) {
    setTimeout(function () {
      grayCodes.validateAndUpdate(textbox);
    }, 10);
  };

  this.onBlur = function (textbox) {
    this.validateAndUpdate(textbox);
  };

  this.drawOutputContent = function () {
    switch (currentMode) {
      case TRANSLATION:
        if (output_internal1.length != output_spans1.length) {

          // delete all spans
          while (output_content1.firstChild) {
            output_content1.removeChild(output_content1.lastChild);
          }
          output_spans1 = [];

          // enter new spans
          for (i = 0; i < output_internal1.length; i++) {
            const new_span = document.createElement("span");
            output_content1.appendChild(new_span);
            new_span.innerText = output_internal1[i];
            output_spans1.push(new_span);
          }
          if (output_spans1.length > 0) {
            output_spans1[output_spans1.length - 1].classList.add("highlightgreen");
            if (translation_direction == GRAY_TO_BIN && output_spans1.length > 1)
              output_spans1[output_spans1.length - 2].classList.add("highlightorange");
            translation_anim_pending = REMOVE_OUTPUT_COLOR;
          }
        }
        break;

      case PRESUCCESSOR:
        if (!redraw_presuccessor) return;
        redraw_presuccessor = false;
        // delete all spans
        while (output_content2.firstChild) {
          output_content2.removeChild(output_content2.lastChild);
        }
        output_spans2 = [];

        // enter new spans
        for (i = 0; i < output_internal2.length; i++) {
          const new_span = document.createElement("span");
          output_content2.appendChild(new_span);
          new_span.innerText = output_internal2[i];
          output_spans2.push(new_span);
          if (presuccessor_anim_pending == COPY_INPUT_TO_OUTPUT) {
            output_spans2[i].classList.add("highlightgray");
          }
          else if (presuccessor_anim_pending == LOCK_IN_OUTPUT && i != presuccessor_flipped_bit) {
            output_spans2[i].classList.add("highlightgray");
          }
        }

        if (presuccessor_anim_pending == COPY_INPUT_TO_OUTPUT) presuccessor_anim_pending = HIGHLIGHT_ONES;
        break;

      default:
        break;
    }
  };

  this.showTranslationAnim = function () {
    switch (translation_anim_pending) {
      case FIRST:
        input_spans1[0].classList.add("highlightorange");
        this.drawTranslationArrow(0, 1, 0);
        translation_anim_pending = NONE;
        break;

      case SHIFT_ORANGE:
        if (translation_direction == BIN_TO_GRAY) {
          if (k_translation > 1) input_spans1[k_translation - 2].classList.remove("highlightorange");
          input_spans1[k_translation - 1].classList.add("highlightorange");
          input_spans1[k_translation].classList.add("highlightorange");
          this.drawTranslationArrow(k_translation - 1, 0, 0);
          translation_anim_pending = NONE;
        } else {
          input_spans1[k_translation - 1].classList.remove("highlightorange");
          if (k_translation > 1) output_spans1[k_translation - 2].classList.remove("highlightorange");
          output_spans1[k_translation - 1].classList.add("highlightorange");
          input_spans1[k_translation].classList.add("highlightorange");
          this.drawTranslationArrow(k_translation - 1, 0, 1);
          translation_anim_pending = NONE;
        }
        break;

      case REMOVE_OUTPUT_COLOR:
        output_spans1[output_spans1.length - 1].classList.remove("highlightgreen");
        if (k_translation < input_field.value.length) {
          translation_anim_pending = SHIFT_ORANGE;
        } else {
          translation_anim_pending = END;
        }
        break;

      case END:
        if (translation_direction == BIN_TO_GRAY) {
          input_spans1[k_translation - 2].classList.remove("highlightorange");
          input_spans1[k_translation - 1].classList.remove("highlightorange");
          this.drawTranslationArrow(0, 2);
        } else {
          output_spans1[k_translation - 2].classList.remove("highlightorange");
          input_spans1[k_translation - 1].classList.remove("highlightorange");
          this.drawTranslationArrow(0, 2);
        }

        FINISHEDTRANSLATION = true;
        ISPAUSED = true;
        translation_anim_pending = NONE;
        break;

      default:
        break;
    }

    stepCountTranslation++;
  };

  this.translateStep = function () {
    if (translation_anim_pending != NONE) {
      this.showTranslationAnim();
      return;
    }

    if (k_translation == 0) {
      output_internal1 += input_spans1[k_translation].innerText;
      k_translation++;
      stepCountTranslation++;
      translation_anim_pending = SHIFT_ORANGE;
    } else if (k_translation < input_field.value.length) {
      if (translation_direction == BIN_TO_GRAY) {
        binary_n_minus_one = input_field.value[k_translation - 1];
        binary_n = input_field.value[k_translation];
        output_internal1 += binary_n_minus_one ^ binary_n;
      } else {
        binary_n_minus_one = output_internal1[k_translation - 1];
        gray_n = input_field.value[k_translation];
        output_internal1 += binary_n_minus_one ^ gray_n;
      }
      k_translation++;
      stepCountTranslation++;
    }
  };

  this.flipBit = function (string, index) {
    if (string[index] == "0") {
      return string.substring(0, index) + "1" + string.substring(index + 1);
    } else {
      return string.substring(0, index) + "0" + string.substring(index + 1);
    }
  };

  this.showPresuccessorAnim = function () {
    switch (presuccessor_anim_pending) {
      case HIGHLIGHT_ONES:
        for (i = 0; i < input_spans2.length; i++) {
          if (input_spans2[i].innerText == "1") {
            input_spans2[i].classList.add("highlightgreen");
          }
        }
        presuccessor_anim_pending = DISPLAY_PARITY;
        stepCountPreSucccessor++;
        break;

      case DISPLAY_PARITY:
        if ((input_field.value.match(/1/g) || []).length % 2 == 0) {
          input_indicator.innerHTML = "EVEN";
        }
        else {
          input_indicator.innerHTML = "ODD";
        }
        presuccessor_anim_pending = HIGHLIGHT_INPUT_FLIP;
        stepCountPreSucccessor++;
        break;

      case HIGHLIGHT_INPUT_FLIP:
        if (presuccessor_direction == SUCCESSOR) {
          if ((input_field.value.match(/1/g) || []).length % 2 == 0) {
            input_spans2[input_spans2.length - 1].classList.add("highlightdarkorange");
          } else {
            last_one_index = input_field.value.lastIndexOf("1");
            input_spans2[last_one_index].classList.add("highlightdarkorange");

          }
        }
        else {
          if ((input_field.value.match(/1/g) || []).length % 2 == 1) {
            input_spans2[input_spans2.length - 1].classList.add("highlightdarkorange");
          } else {
            last_one_index = input_field.value.lastIndexOf("1");
            input_spans2[Math.max(last_one_index, 0)].classList.add("highlightdarkorange");

          }
        }

        presuccessor_anim_pending = NONE;
        stepCountPreSucccessor++;
        break;

      case LOCK_IN_BIT:
        presuccessor_anim_pending = LOCK_IN_OUTPUT;
        redraw_presuccessor = true;
        stepCountPreSucccessor++;
        break;

      case LOCK_IN_OUTPUT:
        input_spans2.forEach((currentElement) => {
          currentElement.classList.remove("highlightgreen");
          currentElement.classList.remove("highlightdarkorange");
        });
        input_indicator.innerHTML = "";
        this.drawPreSuccessorArrow(0, 2);
        presuccessor_anim_pending = FINISH;
        stepCountPreSucccessor++;
        break;

      case FINISH:
        stepCountPreSucccessor++;
        redraw_presuccessor = true;
        presuccessor_anim_pending = NONE;
        FINISHEDPRESUCCESSOR = true;
        ISPAUSED = true;
        break;

      default:
        break;
    }
  };

  this.presuccessorStep = function () {
    if (presuccessor_anim_pending != NONE) {
      this.showPresuccessorAnim();
      return;
    }

    if (presuccessor_direction == SUCCESSOR) {
      if (k_presuccessor == 0) {
        number_of_ones = (input_field.value.match(/1/g) || []).length;
        k_presuccessor++;
        stepCountPreSucccessor++;
        output_internal2 = input_field.value;
        redraw_presuccessor = true;
        presuccessor_anim_pending = COPY_INPUT_TO_OUTPUT;
        return;
      }

      if (k_presuccessor == 1) {
        if (number_of_ones % 2 == 0) {
          presuccessor_flipped_bit = input_field.value.length - 1;
          output_internal2 = this.flipBit(output_internal2, presuccessor_flipped_bit);
          output_spans2[input_field.value.length - 1].classList.remove("highlightgray");
          output_spans2[input_field.value.length - 1].classList.add("highlightgreen");
          this.drawPreSuccessorArrow(input_field.value.length - 1, 1, true);
          presuccessor_anim_pending = LOCK_IN_BIT;
        }
        else {
          last_one_index = input_field.value.lastIndexOf("1");
          presuccessor_flipped_bit = Math.max(last_one_index - 1, 0);
          output_internal2 = this.flipBit(output_internal2, presuccessor_flipped_bit);
          output_spans2[Math.max(last_one_index - 1, 0)].classList.remove("highlightgray");
          output_spans2[Math.max(last_one_index - 1, 0)].classList.add("highlightgreen");
          this.drawPreSuccessorArrow(Math.max(last_one_index - 1, 0), Math.max(last_one_index - 1, 0) == 0 ? 1 : 0, true);

          presuccessor_anim_pending = LOCK_IN_BIT;
        }
        stepCountPreSucccessor++;
        k_presuccessor++;
        return;
      }
    } else {
      if (k_presuccessor == 0) {
        number_of_ones = (input_field.value.match(/1/g) || []).length;
        k_presuccessor++;
        stepCountPreSucccessor++;
        output_internal2 = input_field.value;
        redraw_presuccessor = true;
        presuccessor_anim_pending = COPY_INPUT_TO_OUTPUT;
        return;
      }

      if (k_presuccessor == 1) {
        if (number_of_ones % 2 == 1) {
          presuccessor_flipped_bit = input_field.value.length - 1;
          output_internal2 = this.flipBit(output_internal2, presuccessor_flipped_bit);
          output_spans2[input_field.value.length - 1].classList.remove("highlightgray");
          output_spans2[input_field.value.length - 1].classList.add("highlightgreen");
          this.drawPreSuccessorArrow(input_field.value.length - 1, 1, true);
          presuccessor_anim_pending = LOCK_IN_BIT;
        } else {
          last_one_index = input_field.value.lastIndexOf("1");
          presuccessor_flipped_bit = Math.max(last_one_index - 1, 0);
          output_internal2 = this.flipBit(output_internal2, presuccessor_flipped_bit);
          output_spans2[Math.max(last_one_index - 1, 0)].classList.remove("highlightgray");
          output_spans2[Math.max(last_one_index - 1, 0)].classList.add("highlightgreen");
          this.drawPreSuccessorArrow(Math.max(last_one_index - 1, 0), Math.max(last_one_index - 1, 0) == 0 ? 1 : 0, true);
          presuccessor_anim_pending = LOCK_IN_BIT;
        }
        stepCountPreSucccessor++;
        k_presuccessor++;
        return;
      }
    }
  };

  this.runInterval = function () {
    if (grayCodes.active) {
      if (!ISPAUSED) {
        grayCodes.stepForward();
      }
      clearInterval(grayCodes.interval);
      runspeed = exec_interval * speed;
      grayCodes.interval = setInterval(grayCodes.runInterval, runspeed);
    }
  };
  this.interval = setInterval(this.runInterval, exec_interval * speed);

  this.runAlgorithm = function () {
    if (!input_length) return;

    switch (currentMode) {
      case TRANSLATION:
        if (!FINISHEDTRANSLATION) ISPAUSED = false;
        break;

      case PRESUCCESSOR:
        if (!FINISHEDPRESUCCESSOR) ISPAUSED = false;
        break;

      default:
        break;
    }
  };

  this.pauseAlgorithm = function () {
    ISPAUSED = true;
  };

  this.stepForward = function () {
    if (currentMode == TRANSLATION) {
      if (FINISHEDTRANSLATION || !input_length) {
        return;
      }
      this.translateStep();
    }
    else if (currentMode == PRESUCCESSOR) {
      if (FINISHEDPRESUCCESSOR || !input_length) {
        return;
      }
      this.presuccessorStep();
    }

    this.drawOutputContent();
  };

  this.stepBackward = function () {
    ISPAUSED = true;

    if (currentMode == TRANSLATION) {
      if (stepCountTranslation <= 0) return;
      var destindex = Math.max(stepCountTranslation - 1, 0);
      output_content1.style.display = "none";
      this.goToBeginning();
      while (stepCountTranslation != destindex) {
        this.stepForward();
      }
      output_content1.style.display = "table-cell";
      this.drawOutputContent();
    }
    else if (currentMode == PRESUCCESSOR) {
      if (stepCountPreSucccessor <= 0) return;
      var destindex = Math.max(stepCountPreSucccessor - 1, 0);
      output_content1.style.display = "none";
      this.goToBeginning();
      while (stepCountPreSucccessor != destindex) {
        this.stepForward();
      }
      output_content1.style.display = "table-cell";

      this.drawOutputContent();
    }
  };

  this.clearAnimations = function () {
    for (i = 0; i < input_spans1.length; i++) {
      input_spans1[i].classList.remove("highlightorange");
    }

    for (i = 0; i < output_spans1.length; i++) {
      output_spans1[i].classList.remove("highlightorange");
    }
    input_spans2.forEach((currentElement) => {
      currentElement.classList.remove("highlightgreen");
      currentElement.classList.remove("highlightdarkorange");
    });
    input_indicator.innerHTML = "";
    this.drawTranslationArrow(0,2,0);
    this.drawPreSuccessorArrow(0,2);
    
  };

  this.goToBeginning = function () {
    ISPAUSED = true;
    FINISHEDTRANSLATION = false;
    translation_anim_pending = FIRST;
    this.clearAnimations();
    output_internal1 = "";
    while (output_content1.firstChild) {
      output_content1.removeChild(output_content1.lastChild);
    }
    output_spans1 = [];

    while (output_content2.firstChild) {
      output_content2.removeChild(output_content2.lastChild);
    }
    k_translation = 0;
    stepCountTranslation = 0;
    // ------------------------------------
    FINISHEDPRESUCCESSOR = false;
    presuccessor_anim_pending = NONE;
    output_internal2 = "";
    redraw_presuccessor = true;
    while (output_content1.firstChild) {
      output_content1.removeChild(output_content1.lastChild);
    }
    output_spans1 = [];

    while (output_content2.firstChild) {
      output_content2.removeChild(output_content2.lastChild);
    }
    output_spans2 = [];
    k_presuccessor = 0;
    stepCountPreSucccessor = 0;
  };

  this.goToEnd = function () {
    if (!input_length) return;
    ISPAUSED = true;

    if (currentMode == TRANSLATION) {
      while (!FINISHEDTRANSLATION) {
        this.stepForward();
      }
    }
    else if (currentMode == PRESUCCESSOR) {
      while (!FINISHEDPRESUCCESSOR) {
        this.stepForward();
      }
    }

    this.drawOutputContent();
  };

  this.clearInput = function () {
    this.goToBeginning();
    input_field.value = "";
    this.updateInputContent();
  };

  this.updateSpeed = function (new_speed) {
    speed = 11 - new_speed;
  };
}

grayCodes = new GrayCodes();
