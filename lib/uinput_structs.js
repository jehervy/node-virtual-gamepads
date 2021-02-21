// note: underscores instead of camel casing was used in variable names. This
// was done to keep the name consistent with the underlying c/c++ files.

var ref = require('ref-napi');
var io = require('./io');
var ArrayType = require('ref-array-napi');
var StructType = require('ref-struct-napi');
var uinput = require('./uinput');

var uinputStructs = {};

uinputStructs.time_t = ref.types.long;
uinputStructs.suseconds_t = ref.types.long;

uinputStructs.timeval = StructType({
  tv_sec: uinputStructs.time_t,
  tv_usec: uinputStructs.suseconds_t
});

uinputStructs.input_event = StructType({
  time: uinputStructs.timeval,
  type: ref.types.uint16,
  code: ref.types.uint16,
  value: ref.types.int32
});

uinputStructs.input_id = StructType({
  bustype: ref.types.uint16,
  vendor: ref.types.uint16,
  product: ref.types.uint16,
  version: ref.types.uint16
});

uinputStructs.uinput_setup = StructType({
    id: uinputStructs.input_id,
    name: ArrayType(ref.types.char, uinput.UINPUT_MAX_NAME_SIZE),
    ff_effects_max: ref.types.uint32
});

uinputStructs.uinput_user_dev = StructType({
  name: ArrayType(ref.types.char, uinput.UINPUT_MAX_NAME_SIZE),
  id: uinputStructs.input_id,
  ff_effects_max: ref.types.uint32,
  absmax: ArrayType(ref.types.int32, uinput.ABS_CNT),
  absmin: ArrayType(ref.types.int32, uinput.ABS_CNT),
  absfuzz: ArrayType(ref.types.int32, uinput.ABS_CNT),
  absflat: ArrayType(ref.types.int32, uinput.ABS_CNT)
});

uinputStructs.UI_DEV_SETUP  = io._IOW( io.UINPUT_IOCTL_BASE, 3, uinputStructs.uinput_setup);

module.exports = uinputStructs;
