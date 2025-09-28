Add-Type -AssemblyName System.Drawing
 = 256
 = New-Object -TypeName System.Drawing.Bitmap -ArgumentList , 
 = [System.Drawing.Graphics]::FromImage()
 = New-Object -TypeName System.Drawing.Rectangle -ArgumentList 0, 0, , 
 = [System.Drawing.Color]::FromArgb(0xFF,0x63,0x66,0xF1)
 = [System.Drawing.Color]::FromArgb(0xFF,0xF4,0x72,0xB6)
 = New-Object -TypeName System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList , , , 45.0
.FillRectangle(, )
 = New-Object -TypeName System.Drawing.Font -ArgumentList 'Segoe UI Semibold', 120, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel
 = New-Object -TypeName System.Drawing.StringFormat
.Alignment = [System.Drawing.StringAlignment]::Center
.LineAlignment = [System.Drawing.StringAlignment]::Center
.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
 = New-Object -TypeName System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::White)
 = New-Object -TypeName System.Drawing.RectangleF -ArgumentList 0, 0, , 
.DrawString('MA', , , , )
.Save('icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
.Dispose()
.Dispose()
.Dispose()
.Dispose()
.Dispose()
