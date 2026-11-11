#include <expo-modules-v2/converter/decoders/JniDecode.h>

#include <expo-modules-v2/jni/JDynamicTypes.h>
#include <expo-modules-v2/converter/decoders/DynamicJniDecoder.h>
#include <expo-modules-v2/converter/decoders/JniDecoder.h>

namespace expo::modules::v2 {
  facebook::jsi::Value decodeFromJni(
    JNIEnv* env,
    facebook::jsi::Runtime& rt,
    jobject object,
    const ExpectedType& type
  ) {
    if (object == nullptr) {
      return facebook::jsi::Value::null();
    }

    return type.visit<facebook::jsi::Value>(
      JniDecoder{.env = env, .rt = rt, .object = object}
    );
  }

  facebook::jsi::Value decodeFromJniDynamic(
    JNIEnv* env,
    facebook::jsi::Runtime& rt,
    jobject object
  ) {
    if (object == nullptr) {
      return facebook::jsi::Value::null();
    }

    const CppType kind = JDynamicTypes::kindOf(env, object);
    const DynamicJniDecoder dynamic{.env = env, .rt = rt, .object = object};
    switch (kind) {
      case CppType::STRING: return dynamic.operator()<CppType::STRING>();
      case CppType::LIST: return dynamic.operator()<CppType::LIST>();
      case CppType::MAP: return dynamic.operator()<CppType::MAP>();
      case CppType::RECORD: return dynamic.operator()<CppType::RECORD>();
      case CppType::ANY: throwUnknown(kind);
      default:
        return visitLeafKind<facebook::jsi::Value>(
          kind,
          JniDecoder{.env = env, .rt = rt, .object = object}
        );
    }
  }
} // namespace expo::modules::v2
