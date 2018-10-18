/*
 * The MIT License
 *
 * Original work sponsored and donated by The Danish Health Data Authority (http://www.sundhedsdatastyrelsen.dk)
 *
 * Copyright (C) 2017 The Danish Health Data Authority (http://www.sundhedsdatastyrelsen.dk)
 *
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package dk.sundhedsdatastyrelsen.organdonor;

import java.util.ArrayList;
import java.util.List;

public class OrganDonorOIDs {
    private static final String HEART = "1.2.208.184.15.20";
    private static final String KEDNEYS = "1.2.208.184.15.21";
    private static final String LUNGS = "1.2.208.184.15.22";
    private static final String CORNEAS = "1.2.208.184.15.23";
    private static final String LIVER = "1.2.208.184.15.24";
    private static final String SMALL_INTESTINE = "1.2.208.184.15.25";
    private static final String PANCREAS = "1.2.208.184.15.26";
    private static final String SKIN = "1.2.208.184.15.27";
    private static final String RELATIVE = "1.2.208.184.15.40";


    private static List<String> oidList = new ArrayList<>();

    public OrganDonorOIDs(){
        InitializeList();
    }

    private void InitializeList() {
        oidList.add(HEART);
        oidList.add(KEDNEYS);
        oidList.add(LUNGS);
        oidList.add(CORNEAS);
        oidList.add(LIVER);
        oidList.add(SMALL_INTESTINE);
        oidList.add(PANCREAS);
        oidList.add(SKIN);
        oidList.add(RELATIVE);
    }

    public static List<String> getOidList() {
        return oidList;
    }




}
