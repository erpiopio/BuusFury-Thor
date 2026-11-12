
#include "../gbarecomp/src/runtime/thor_scouter_map.h"
#include <fstream>
#include <iostream>
#include <iterator>
#include <string>
#include <cstdlib>
using Bytes = std::vector<uint8_t>;
Bytes load(const std::string& path) {
    std::ifstream f(path, std::ios::binary);
    if (!f) throw std::runtime_error(path);
    return Bytes(std::istreambuf_iterator<char>(f), {});
}
uint32_t word(const Bytes& b, size_t p) {
    if (p + 4 > b.size()) throw std::out_of_range("word");
    return uint32_t(b[p]) | uint32_t(b[p+1])<<8 | uint32_t(b[p+2])<<16 | uint32_t(b[p+3])<<24;
}
uint32_t color(uint16_t c) {
    auto channel=[](uint32_t v){return (v<<3)|(v>>2);};
    return 0xff000000u | channel(c&31)<<16 | channel((c>>5)&31)<<8 | channel((c>>10)&31);
}
int main() {
    const std::string home = std::getenv("HOME");
    auto rom = load(home+"/buusfury-map-investigacion/baserom-espanol.gba");
    const Bytes original_rom=rom;
    thor_scouter::Renderer renderer;
    std::vector<uint32_t> pixels;
    for (const auto* name: {"select","desplazado","tercero"}) {
        const std::string filename=home+"/Descargas/buusfury-mapa-"+name+".state";
        auto state=load(filename); const Bytes original=state;
        const size_t bus=0xfc, iw=bus+0x40000, vram=bus+0x48400, pal=bus+0x48000;
        auto rw=[&](size_t a){return word(state,iw+a);};
        uint32_t actor=rw(0x1b94);
        unsigned player_phase = 0;
        bool found_phase = false;
        for (unsigned i = 0; i < 4; ++i) {
            if (std::memcmp(rom.data()+0x74cf2c+i*64,
                state.data()+vram+0x10000+1022*32,64)==0) {player_phase=i;found_phase=true;break;}
        }
        if(!found_phase) throw std::runtime_error("player phase not found");
        bool valid=renderer.render(rom.data(),rom.size(),state.data()+iw+0x1068,
            uint16_t(rw(0x197c)), int32_t(word(state,bus+actor-0x2000000+0x1a0)),
            int32_t(word(state,bus+actor-0x2000000+0x1a4)),
            int32_t(rw(0x1a38)),int32_t(rw(0x1a3c)),pixels,player_phase*8);
        if (!valid) throw std::runtime_error(std::string("invalid ")+name);
        int sx=int16_t(word(state,0x609a8+0x18)&65535);
        int sy=int16_t(word(state,0x609a8+0x1a)&65535);
        int errors=0;
        for(int y=0;y<160;++y) for(int x=0;x<240;++x) {

            unsigned xx=unsigned(x+sx)&255, yy=unsigned(y+sy)&255;
            size_t ti=vram+0xf000+(yy/8*32+xx/8)*2;
            uint16_t tile=uint16_t(word(state,ti));
            unsigned tx=xx&7,ty=yy&7;
            if(tile&1024)tx=7-tx;
            if(tile&2048)ty=7-ty;
            unsigned idx=state[vram+(tile&1023)*64+ty*8+tx];
            uint32_t expected=color(uint16_t(word(state,pal+idx*2)));
            for (int oi=127;oi>=0;--oi) {
                size_t at=bus+0x60400+oi*8;
                uint16_t a0=uint16_t(word(state,at));
                uint16_t a1=uint16_t(word(state,at+2));
                uint16_t a2=uint16_t(word(state,at+4));
                if((a0&0x300)==0x200||(a2&1023)<1020)continue;
                int ox=int(a1&511);if(ox>=256)ox-=512;
                int oy=int(a0&255);if(oy>=160)oy-=256;
                int dx=x-ox,dy=y-oy;
                if(dx>=0&&dy>=0&&dx<8&&dy<8) {
                    unsigned objidx=state[vram+0x10000+(a2&1023)*32+dy*8+dx];
                    if(objidx)expected=color(uint16_t(word(state,pal+512+objidx*2)));
                }
            }
            errors+=pixels[y*240+x]!=expected;
        }
        if(errors)throw std::runtime_error(std::string(name)+" mismatch "+std::to_string(errors));
        if(state!=original||rom!=original_rom)throw std::runtime_error("guest modified");
        std::cout<<name<<" exact map and marker pixels, guest memory unchanged\n";
        std::ofstream out(std::string("/tmp/scouter-")+name+".argb",std::ios::binary);
        out.write(reinterpret_cast<const char*>(pixels.data()),pixels.size()*4);
    }
    unsigned count=word(rom,0x74ca24),table=word(rom,0x74ca28)-0x8000000;
    std::array<uint8_t,512> save;save.fill(255);
    unsigned rooms=0;
    for(unsigned i=0;i<count;++i) {
        unsigned group=word(rom,table+i*4)-0x8000000;
        unsigned n=word(rom,group+20);
        for(unsigned j=0;j<n;++j) {
            unsigned room=word(rom,group+24+j*4)-0x8000000;
            uint16_t area=uint16_t(word(rom,room));
            if(!renderer.render(rom.data(),rom.size(),save.data(),area,100*256,100*256,512,512,pixels))
                throw std::runtime_error("region rejected "+std::to_string(area));
            ++rooms;
        }
    }
    std::cout<<count<<" region groups, "<<rooms<<" room identifiers decoded\n";
    if(renderer.render(rom.data(),4,save.data(),0,0,0,512,512,pixels))
        throw std::runtime_error("invalid ROM accepted");
}
