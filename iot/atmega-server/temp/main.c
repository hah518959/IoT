#include <avr/io.h>
#include <util/delay.h>

unsigned char fnd_data[] = { 0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F };

int main(void) {
    DDRA = 0xFF; // PORTA: 8 LED 출력
    DDRB = 0xFF; // PORTB: 단일 LED 출력
    DDRC = 0xFF; // PORTC: FND 데이터 출력
    DDRE = 0x00; // PORTE: 버튼 입력 설정 (Pull-up 가정 등)

    while (1) {
        // PORTE의 0번 핀(PE0) 상태를 읽어옴 (눌리면 0 혹은 1)
        if ((PINE & 0x01) == 0) { 
            PORTB = 0x01; // 버튼 누르면 PORTB LED On
            PORTA = 0xAA; // PORTA 패턴 출력
        } else {
            PORTB = 0x00; // 안 누르면 Off
            PORTA = 0x55; 
        }

        // FND 동적 구동 (예시로 숫자 5, 6, 7, 8 출력)
        PORTC = fnd_data[5]; PORTG = ~(1 << 0); _delay_ms(2);
        PORTC = fnd_data[6]; PORTG = ~(1 << 1); _delay_ms(2);
        PORTC = fnd_data[7]; PORTG = ~(1 << 2); _delay_ms(2);
        PORTC = fnd_data[8]; PORTG = ~(1 << 3); _delay_ms(2);
    }
    return 0;
}
