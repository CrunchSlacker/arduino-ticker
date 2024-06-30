#include <Arduino.h>
#include <LiquidCrystal.h>
#include <Servo.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
Servo servoOne;

void setup()
{
  // put your setup code here, to run once:
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.clear();
  servoOne.attach(13);
}

void loop()
{
  // put your main code here, to run repeatedly:
  if (Serial.available() > 0)
  {
    String data = Serial.readStringUntil('$');
    data.trim();

    String num = Serial.readString();
    num.trim();

    int hundreds = String(num[0]).toInt();
    int hundredsAngle = map(hundreds, 0, 9, 0, 179);
    Serial.print(hundredsAngle);
    servoOne.write(hundredsAngle);
    
    lcd.clear();
    lcd.print(num);
  }
}
