var Struct   = require('struct')
	io       = require('./io');

var uinput = {};

uinput.UI_SET_EVBIT  = io._IOW( io.UINPUT_IOCTL_BASE, 100, io['int']);
uinput.UI_SET_KEYBIT = io._IOW( io.UINPUT_IOCTL_BASE, 101, io['int']);
uinput.UI_SET_RELBIT = io._IOW( io.UINPUT_IOCTL_BASE, 102, io['int']);
uinput.UI_SET_ABSBIT = io._IOW( io.UINPUT_IOCTL_BASE, 103, io['int']);

uinput.UI_DEV_CREATE  = io._IO( io.UINPUT_IOCTL_BASE, 1 );
uinput.UI_DEV_DESTROY = io._IO( io.UINPUT_IOCTL_BASE, 2 );

uinput.EV_SYN = 0x00;
uinput.EV_KEY = 0x01;
uinput.EV_REL = 0x02;
uinput.EV_ABS = 0x03;

uinput.BTN_MOUSE  = 0x110;
uinput.BTN_LEFT   = 0x110;
uinput.BTN_RIGHT  = 0x111;
uinput.BTN_MIDDLE = 0x112;

uinput.BTN_MOUSE     = 0x110;
uinput.BTN_LEFT      = 0x110;
uinput.BTN_RIGHT     = 0x111;
uinput.BTN_MIDDLE    = 0x112;
uinput.BTN_SIDE      = 0x113;
uinput.BTN_EXTRA     = 0x114;
uinput.BTN_FORWARD   = 0x115;
uinput.BTN_BACK      = 0x116;
uinput.BTN_TASK      = 0x117;
uinput.BTN_JOYSTICK  = 0x120;
uinput.BTN_TRIGGER   = 0x120;
uinput.BTN_THUMB     = 0x121;
uinput.BTN_THUMB2    = 0x122;
uinput.BTN_TOP       = 0x123;
uinput.BTN_TOP2      = 0x124;
uinput.BTN_PINKIE    = 0x125;
uinput.BTN_BASE      = 0x126;
uinput.BTN_BASE2     = 0x127;
uinput.BTN_BASE3     = 0x128;
uinput.BTN_BASE4     = 0x129;
uinput.BTN_BASE5     = 0x12a;
uinput.BTN_BASE6     = 0x12b;
uinput.BTN_DEAD      = 0x12f;
uinput.BTN_GAMEPAD   = 0x130;
uinput.BTN_A         = 0x130;
uinput.BTN_B         = 0x131;
uinput.BTN_C         = 0x132;
uinput.BTN_X         = 0x133;
uinput.BTN_Y         = 0x134;
uinput.BTN_Z         = 0x135;
uinput.BTN_TL        = 0x136;
uinput.BTN_TR        = 0x137;
uinput.BTN_TL2       = 0x138;
uinput.BTN_TR2       = 0x139;
uinput.BTN_SELECT    = 0x13a;
uinput.BTN_START     = 0x13b;
uinput.BTN_MODE      = 0x13c;
uinput.BTN_THUMBL    = 0x13d;
uinput.BTN_THUMBR    = 0x13e;
uinput.REL_X     = 0x00;
uinput.REL_Y     = 0x01;
uinput.REL_WHEEL = 0x08;
uinput.ABS_X     = 0x00;
uinput.ABS_Y     = 0x01;
uinput.ABS_Z     = 0x02;

uinput.ABS_RX			= 0x03;
uinput.ABS_RY			= 0x04;
uinput.ABS_RZ			= 0x05;
uinput.ABS_HAT0X		= 0x10;
uinput.ABS_HAT0Y		= 0x11;
uinput.ABS_MISC = 0x28;

uinput.ABS_MAX  = 0x3f;
uinput.ABS_CNT  = uinput.ABS_MAX + 1;

uinput.ID_BUS = 0;
uinput.BUS_USB = 0x3;

uinput.UINPUT_MAX_NAME_SIZE = 80;

for( var i in uinput ) {
	module.exports[ i ] = uinput[i];
}