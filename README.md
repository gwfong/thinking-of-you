# Thinking Of You
This is the source code for the Thinking Of You (TOY) boxes that built and posted on [Instructables](http://www.instructables.com/id/Simply-Thinking-of-You/). The code for each of the box is nearly identical except that since each of the boxes have different hardware, the code differs to handle the different hardare. So in actuality, the design and layout of the code is identical for each of the boxes and differ where different hardware is used.
## Node.js
To run this project I opted to use Node.js. It's much faster to iterate changes and it's fully supported my Intel Edison.
## Bluebird Promises
Promises are used to deal with the heavy callback nature of the event programming. It also helps with some of the timing delays since Node.js doesn't have a sleep() command.
## MRAA and UPM
[MRAA](https://github.com/intel-iot-devkit/mraa) nad [UPM](https://github.com/intel-iot-devkit/upm) are the libraries to control the hardware.
## Pushbullet
[Pushbullet](https://www.npmjs.com/package/pushbullet) is what powers the messaging across the internet.
## Setup
### Edison
Intel has [Getting Started](https://software.intel.com/en-us/iot/library/edison-getting-started) instructions. Follow them thoroughly. At the end of the process you should be able to open a terminal window, run node, and print "Hello, World!".
## The Code
Each box needs an email, a Pushbullet account, and something called an iden. The iden can be obtained by inspecting the response of any pushbullet request. Pushbullet uses it to identify the sender. In this project it is used to ignore messages sent by oneself.

Each component, like the LCD clock or the LED heart, adheres to a set of standard methods: init(), selfTestAsync(), start(), startThinkingOfYou(), and stopThinkingOfYou(). They do whatever is appropriate for that component to implement the purpose of the method. The button components, because they are input devices, only implement the first three methods.

main.js is the controller between any input signals and the designated output signal. For example, it'll listen for a message from Pushbullet and decide which output device to animate.
