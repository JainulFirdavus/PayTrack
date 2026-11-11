#include <expo-modules-v2/converter/decoders/DynamicJniDecoder.h>

#include <stdexcept>

#include <expo-modules-v2/jni/JRecordRegistry.h>
#include <expo-modules-v2/converter/decoders/JniDecode.h>
#include <expo-modules-v2/converter/JsiBuilders.h>
#include <expo-modules-v2/utils/Throw.h>
#include <kolibri/Ref.h>
#include <kolibri/class.h>
#include <kolibri/string_utils.h>

namespace expo::modules::v2 {
  template<>
  facebook::jsi::Value DynamicJniDecoder::operator()<CppType::STRING>() const {
    return facebook::jsi::String::createFromUtf8(
      rt,
      kolibri::toStdString(env, reinterpret_cast<jstring>(object))
    );
  }

  template<>
  facebook::jsi::Value DynamicJniDecoder::operator()<CppType::LIST>() const {
    const auto list = kolibri::UnownedRef<kolibri::JList>(object);
    const jint size = list->size(env);
    return buildJsArray(rt, static_cast<size_t>(size), [&](size_t i) {
      const kolibri::Ref<> element = list->get(env, static_cast<jint>(i));
      return decodeFromJniDynamic(env, rt, element.get());
    });
  }

  template<>
  facebook::jsi::Value DynamicJniDecoder::operator()<CppType::MAP>() const {
    facebook::jsi::Object result(rt);
    const kolibri::Ref<kolibri::JSet> entrySet =
      kolibri::UnownedRef<kolibri::JMap>(object)->entrySet(env);
    const kolibri::Ref<kolibri::JIterator> iterator = entrySet->iterator(env);
    while (iterator->hasNext(env)) {
      const auto entryRef = iterator->next(env).staticCast<kolibri::JMapEntry>();
      kolibri::Ref<> key = entryRef->getKey(env);
      kolibri::Ref<> val = entryRef->getValue(env);
      result.setProperty(
        rt,
        facebook::jsi::PropNameID::forUtf8(
          rt,
          kolibri::toStdString(env, reinterpret_cast<jstring>(key.get()))
        ),
        decodeFromJniDynamic(env, rt, val.get())
      );
    }
    return result;
  }

  template<>
  facebook::jsi::Value DynamicJniDecoder::operator()<CppType::RECORD>() const {
    const kolibri::Ref<kolibri::JMap> map = JRecordRegistry::dynamicRecordToMap(env, object);
    if (!map) {
      throwRuntimeError({"A record codec was unregistered between classification and decode"});
    }
    return decodeFromJniDynamic(env, rt, map.get());
  }
} // namespace expo::modules::v2
