#pragma once

#include <cstdint>

namespace buus_fury {

void install_extended_view(std::uint32_t extra_left,
                           std::uint32_t extra_right);

#if defined(__ANDROID__)
int thor_item_bus_read_override(std::uint32_t pc, std::uint32_t address,
                               std::uint32_t width, std::uint32_t original,
                               std::uint32_t* out_value);
#endif

}  // namespace buus_fury
