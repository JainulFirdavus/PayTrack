#pragma once

#include <jni.h>
#include <jsi/jsi.h>

#include <expo-modules-v2/descriptor/CppType.h>

namespace expo::modules::v2 {
  struct DynamicJniDecoder {
    JNIEnv* env;
    facebook::jsi::Runtime& rt;
    jobject object;

    template<CppType K>
    facebook::jsi::Value operator()() const = delete;
  };

  // clang-format off
  template<> facebook::jsi::Value DynamicJniDecoder::operator()<CppType::STRING>() const;
  template<> facebook::jsi::Value DynamicJniDecoder::operator()<CppType::LIST>() const;
  template<> facebook::jsi::Value DynamicJniDecoder::operator()<CppType::MAP>() const;
  template<> facebook::jsi::Value DynamicJniDecoder::operator()<CppType::RECORD>() const;
  // clang-format on
} // namespace expo::modules::v2
