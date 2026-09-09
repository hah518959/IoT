const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ 본인 컴퓨터의 avr-gcc.exe 및 avr-objcopy.exe 실제 경로로 수정해주세요!
// 역슬래시(\) 대신 슬래시(/)를 사용해야 에러가 나지 않습니다.
// 본인의 실제 bin 폴더 경로에 맞게 작성하세요!
// 슬래시(/)를 사용하는 경우 (추천)
const AVR_GCC_PATH = 'C:/Users/user/Downloads/avr8-gnu-toolchain-4.0.0.52-win32.any.x86_64/avr8-gnu-toolchain-win32_x86_64/bin/avr-gcc.exe';
const AVR_OBJCOPY_PATH = 'C:/Users/user/Downloads/avr8-gnu-toolchain-4.0.0.52-win32.any.x86_64/avr8-gnu-toolchain-win32_x86_64/bin/avr-objcopy.exe';

app.post('/api/compile', (req, res) => {
  const { code } = req.body;
  const workDir = path.join(__dirname, 'temp');

  // 임시 작업 폴더가 없으면 생성
  if (!fs.existsSync(workDir)) fs.mkdirSync(workDir);

  const cFilePath = path.join(workDir, 'main.c');
  const elfFilePath = path.join(workDir, 'main.elf');
  const hexFilePath = path.join(workDir, 'main.hex');

  // 1. 수신한 C 코드를 파일로 저장
  fs.writeFileSync(cFilePath, code);

  // 2. 컴파일 및 .hex 변환 명령어 (절대 경로 사용)
  const compileCmd = `"${AVR_GCC_PATH}" -mmcu=atmega128 -DF_CPU=16000000UL -O2 -o "${elfFilePath}" "${cFilePath}" && "${AVR_OBJCOPY_PATH}" -O ihex "${elfFilePath}" "${hexFilePath}"`;

  // 3. 명령어 실행
  exec(compileCmd, (error, stdout, stderr) => {
    if (error) {
      const errorMsg = stderr ? stderr.toString() : error.message;
      return res.status(400).json({ success: false, error: errorMsg });
    }

    try {
      // 4. 생성된 .hex 파일 읽어서 반환
      const hexData = fs.readFileSync(hexFilePath, 'utf8');
      res.json({ success: true, hex: hexData });
    } catch (readErr) {
      res.status(500).json({ success: false, error: 'HEX 파일 생성 실패: ' + readErr.message });
    }
  });
});

app.listen(5000, () => {
  console.log('AVR Compile Server running on http://localhost:5000');
});