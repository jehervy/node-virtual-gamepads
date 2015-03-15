// Based on https://github.com/bramp/node-ioctl
#include <node.h>
#include <v8.h>

#include <errno.h>
#include <sys/ioctl.h>

using namespace v8;
using namespace node;

#define TYPE_ERROR(msg) ThrowException(Exception::TypeError(String::New(msg)));

Handle<Value> Ioctl(const Arguments& args) {
	HandleScope scope;

	if (!args[0]->IsInt32())  return TYPE_ERROR("fd must a file handle");
	if (!args[1]->IsNumber()) return TYPE_ERROR("request must be a integer");
	if (!args[2]->IsNumber()) return TYPE_ERROR("data must be a integer");

	int fd      = args[0]->Int32Value();
	int request = args[1]->Int32Value();
	int data    = args[2]->Int32Value();

	int ret = ioctl(fd, request, data);

	if (ret < 0) return ThrowException(UVException(errno, NULL, "ioctl"));

	return scope.Close(Number::New(ret));
}

void init(Handle<Object> exports) {
  exports->Set(String::NewSymbol("ioctl"), FunctionTemplate::New(Ioctl)->GetFunction());
}

NODE_MODULE(ioctl, init)