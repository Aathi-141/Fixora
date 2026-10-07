import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

export default function ServiceHistoryScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [expandedReceiptId, setExpandedReceiptId] = useState('b_comp_1');
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [customBookings, setCustomBookings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('fixora_all_bookings').then((raw) => {
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) setCustomBookings(list);
          } catch (e) {}
        }
      });
    }, [])
  );

  // Customer seed data
  const customerOngoing = [
    {
      _id: 'b_on_1',
      bookingRef: 'BK-8402',
      serviceTitle: 'Plumbing Repair - Leaking Kitchen Pipe',
      category: 'Plumber',
      provider: {
        name: 'Sunil Perera',
        specialization: 'Master Plumber • 12 Yrs Exp',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      },
      scheduledDate: 'Today, Oct 02, 2026',
      timeSlot: '10:00 AM',
      status: 'On the Way (15m ETA)',
      pricing: { totalAmount: 4250 },
    },
  ];

  const customerCompleted = [
    {
      _id: 'b_comp_1',
      bookingRef: 'FX-76210',
      serviceTitle: 'Deep Home Cleaning & Disinfection',
      category: 'Cleaner',
      provider: {
        name: 'Chaminda Wickramasinghe',
        specialization: 'Cleaning Specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      },
      scheduledDate: '25 Sep 2026',
      timeSlot: '09:00 AM',
      status: 'Completed',
      pricing: { totalAmount: 3750 },
      transactionId: 'TXN-98432100',
    },
    {
      _id: 'b_comp_2',
      bookingRef: 'FX-64301',
      serviceTitle: 'Electrical Wiring Safety Inspection',
      category: 'Electrician',
      provider: {
        name: 'Ramesh Mendis',
        specialization: 'Senior Electrician',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      },
      scheduledDate: '12 Sep 2026',
      timeSlot: '02:00 PM',
      status: 'Completed',
      pricing: { totalAmount: 3350 },
      transactionId: 'TXN-77319200',
    },
  ];

  // Provider dynamic filtering: Providers only see jobs where they are the specialist
  const isProvider = user?.role === 'provider';

  let dynamicOngoing = [...customerOngoing];
  let dynamicCompleted = [...customerCompleted];

  customBookings.forEach((b) => {
    const isCancelledOrDone =
      b.status?.toLowerCase() === 'completed' || b.status?.toLowerCase() === 'cancelled';
    const formattedItem = {
      ...b,
      serviceTitle: b.serviceTitle || b.provider?.specialization || 'Home Service',
      category: b.serviceCategory || b.category || b.provider?.category || 'Cleaner',
      scheduledDate: b.scheduledDate || 'Today',
      timeSlot: b.timeSlot || '10:00 AM',
      status: b.status?.toLowerCase() === 'cancelled' ? 'Cancelled' : (b.status || 'Confirmed'),
      pricing: b.pricing || { totalAmount: 3750 },
      provider: b.provider || {
        name: 'Chaminda Wickramasinghe',
        specialization: 'Cleaning Specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      },
    };

    if (isCancelledOrDone) {
      dynamicOngoing = dynamicOngoing.filter((o) => o._id !== b._id && o.bookingRef !== b.bookingRef);
      if (!dynamicCompleted.some((c) => c._id === b._id || c.bookingRef === b.bookingRef)) {
        dynamicCompleted.unshift(formattedItem);
      }
    } else {
      if (!dynamicOngoing.some((o) => o._id === b._id || o.bookingRef === b.bookingRef)) {
        dynamicOngoing.unshift(formattedItem);
      }
    }
  });

  let ongoingBookings = dynamicOngoing;
  let completedBookings = dynamicCompleted;

  if (isProvider) {
    if (user?.name?.includes('Sunil')) {
      ongoingBookings = dynamicOngoing.filter((b) => b.provider?.name?.includes('Sunil'));
      completedBookings = [];
    } else if (user?.name?.includes('Ramesh')) {
      ongoingBookings = [];
      completedBookings = dynamicCompleted.filter((b) => b.provider?.name?.includes('Ramesh'));
    } else if (user?.name?.includes('Chaminda')) {
      ongoingBookings = [];
      completedBookings = dynamicCompleted.filter((b) => b.provider?.name?.includes('Chaminda'));
    } else {
      ongoingBookings = [];
      completedBookings = [];
    }
  }

  const currentList = activeTab === 'ongoing' ? ongoingBookings : completedBookings;

  const canDownloadInvoice = () => {
    return true;
  };

  const handleDownloadReceipt = async (item) => {
    setDownloadingId(item._id);
    let invoiceData = null;

    try {
      const invoiceNumber = `INV-${item.bookingRef || 'FX-88431'}-${item.transactionId ? item.transactionId.slice(-4) : '9021'}`;
      const invoiceDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const customerName = user?.name || item.customer?.name || item.customerName || 'Kasun Perera';
      const customerPhone = user?.phone || item.customer?.phone || '+94 77 123 4567';
      const customerAddress = item.serviceAddress || user?.address || 'No 42, New Kandy Road, Malabe, Sri Lanka';
      const providerName = item.provider?.name || item.provider?.user?.name || 'Chaminda Wickramasinghe';
      const providerSpec = item.provider?.specialization || `${item.category || 'Service'} Specialist`;
      const totalAmount = item.pricing?.totalAmount || 3750;
      const baseRate = Math.round(totalAmount * 0.65);
      const laborRate = Math.round(totalAmount * 0.28);
      const platformFee = Math.max(0, totalAmount - baseRate - laborRate);
      const paymentMethod = item.paymentMethod || 'Visa ending in 4892';
      const transactionId = item.transactionId || 'TXN-98432100';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fixora Tax Invoice - ${item.bookingRef}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; padding: 40px; margin: 0; background: #ffffff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1E4D2B; padding-bottom: 20px; }
    .brand-title { font-size: 26px; font-weight: 800; color: #1E4D2B; letter-spacing: 2px; }
    .brand-tagline { font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .company-meta { font-size: 11px; color: #6B7280; margin-top: 6px; line-height: 1.4; }
    .inv-header { text-align: right; }
    .inv-title { font-size: 20px; font-weight: 800; color: #111827; }
    .inv-meta { font-size: 12px; color: #4B5563; margin-top: 4px; }
    .status-badge { display: inline-block; background: #DCFCE7; color: #15803D; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 10px; margin-top: 8px; border: 1px solid #86EFAC; }
    .grid { display: flex; justify-content: space-between; margin-top: 28px; margin-bottom: 28px; }
    .col { width: 48%; }
    .col-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1E4D2B; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; letter-spacing: 0.5px; }
    .col p { font-size: 13px; line-height: 1.5; margin: 3px 0; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #EBF4EE; color: #1E4D2B; text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    td { padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #374151; }
    .text-right { text-align: right; }
    .summary-wrap { display: flex; justify-content: flex-end; margin-top: 20px; }
    .summary-box { width: 280px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4B5563; }
    .grand-total { border-top: 2px solid #1E4D2B; padding-top: 8px; margin-top: 6px; font-size: 16px; font-weight: 800; color: #1E4D2B; }
    .footer { margin-top: 45px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 11px; color: #9CA3AF; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">FIXORA</div>
      <div class="brand-tagline">YOUR HOME, OUR SERVICES</div>
      <div class="company-meta">
        Fixora Platform Technologies (Pvt) Ltd<br/>
        Level 12, West Tower, World Trade Center, Colombo 01, Sri Lanka<br/>
        VAT / Tax Reg No: LK-VAT-8849201
      </div>
    </div>
    <div class="inv-header">
      <div class="inv-title">OFFICIAL TAX INVOICE</div>
      <div class="inv-meta"><strong>Invoice No:</strong> ${invoiceNumber}</div>
      <div class="inv-meta"><strong>Date:</strong> ${invoiceDate}</div>
      <div class="status-badge">&#10003; PAYMENT CONFIRMED (PAID)</div>
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <div class="col-title">Billed To (Customer)</div>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      <p><strong>Service Location:</strong> ${customerAddress}</p>
    </div>
    <div class="col">
      <div class="col-title">Booking & Transaction Summary</div>
      <p><strong>Booking Ref:</strong> #${item.bookingRef}</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p><strong>Service Title:</strong> ${item.serviceTitle}</p>
      <p><strong>Specialist:</strong> ${providerName} (${providerSpec})</p>
      <p><strong>Completed On:</strong> ${item.scheduledDate} at ${item.timeSlot}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Category</th>
        <th class="text-right">Amount (LKR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Base Professional Service</strong><br/><span style="font-size: 11px; color: #6B7280;">Certified specialist on-site repair and diagnostics</span></td>
        <td>${item.category}</td>
        <td class="text-right">Rs. ${baseRate.toLocaleString()}</td>
      </tr>
      <tr>
        <td><strong>Diagnostic Labor & Field Inspection</strong><br/><span style="font-size: 11px; color: #6B7280;">Field testing, material preparation and system overhaul</span></td>
        <td>Labor</td>
        <td class="text-right">Rs. ${laborRate.toLocaleString()}</td>
      </tr>
      <tr>
        <td><strong>Fixora Safety Guarantee & Platform Fee</strong><br/><span style="font-size: 11px; color: #6B7280;">Service warranty, homeowner protection and 24/7 priority support</span></td>
        <td>Platform</td>
        <td class="text-right">Rs. ${platformFee.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="summary-wrap">
    <div class="summary-box">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>Rs. ${totalAmount.toLocaleString()}</span>
      </div>
      <div class="summary-row">
        <span>VAT / Tax (0% Residential Exemption):</span>
        <span>Rs. 0</span>
      </div>
      <div class="summary-row grand-total">
        <span>Total Paid in LKR:</span>
        <span>Rs. ${totalAmount.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    This document is a computer-generated tax invoice issued by Fixora Platform Technologies (Pvt) Ltd.<br/>
    For inquiries or support regarding this booking, contact <strong>billing@fixora.lk</strong> or call <strong>+94 11 234 5678</strong>.
  </div>
</body>
</html>
      `;

      invoiceData = {
        item,
        invoiceNumber,
        invoiceDate,
        customerName,
        customerPhone,
        customerAddress,
        providerName,
        providerSpec,
        totalAmount,
        baseRate,
        laborRate,
        platformFee,
        paymentMethod,
        transactionId,
        htmlContent,
      };

      // 1. Web Environment: Direct browser file download & print
      if (Platform.OS === 'web' || (typeof window !== 'undefined' && window.document)) {
        try {
          if (Print && typeof Print.printAsync === 'function') {
            await Print.printAsync({ html: htmlContent });
          }
        } catch (printErr) {
          console.warn('Web print error:', printErr);
        }

        try {
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Fixora_Tax_Invoice_${item.bookingRef || 'Receipt'}.html`;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 600);
        } catch (webErr) {
          console.warn('Web blob download error:', webErr);
        }

        setSelectedInvoice(invoiceData);
        return;
      }

      // 2. Mobile Native Environment: Real PDF generation & Native Sharing/Save
      let pdfUri = null;
      try {
        if (Print && typeof Print.printToFileAsync === 'function') {
          const fileResult = await Print.printToFileAsync({ html: htmlContent });
          pdfUri = fileResult?.uri;
        }
      } catch (nativePrintErr) {
        console.warn('Native Print.printToFileAsync error:', nativePrintErr);
      }

      if (pdfUri) {
        invoiceData.pdfUri = pdfUri;
        try {
          if (Sharing && typeof Sharing.isAvailableAsync === 'function') {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(pdfUri, {
                mimeType: 'application/pdf',
                dialogTitle: `Save Tax Invoice #${item.bookingRef}`,
                UTI: 'com.adobe.pdf',
              });
              setSelectedInvoice(invoiceData);
              return;
            }
          }
        } catch (sharingErr) {
          console.log('Native share sheet dismissed or error:', sharingErr.message);
        }

        // Direct system print dialog which includes "Save as PDF" option
        try {
          if (Print && typeof Print.printAsync === 'function') {
            await Print.printAsync({ html: htmlContent });
            setSelectedInvoice(invoiceData);
            return;
          }
        } catch (printErr) {
          console.warn('Native Print.printAsync error:', printErr);
        }

        setSelectedInvoice(invoiceData);
        Alert.alert(
          'Tax Invoice Generated',
          `Official PDF invoice #${item.bookingRef} is ready in your viewer.`
        );
        return;
      }

      // 3. Fallback: Direct print dialog
      try {
        if (Print && typeof Print.printAsync === 'function') {
          await Print.printAsync({ html: htmlContent });
          setSelectedInvoice(invoiceData);
          return;
        }
      } catch (printAsyncErr) {
        console.warn('Print.printAsync fallback error:', printAsyncErr);
      }

      // 4. Guaranteed In-App Official Tax Invoice View
      setSelectedInvoice(invoiceData);
      Alert.alert(
        'Tax Invoice Ready',
        `Official tax invoice #${item.bookingRef} is ready for review.`
      );
    } catch (err) {
      console.warn('PDF generation error:', err);
      if (invoiceData) {
        setSelectedInvoice(invoiceData);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBookAgain = (item) => {
    const provider = item.provider;
    // 1. Check if provider is currently available
    if (provider && provider.isAvailable === false) {
      Alert.alert(
        'Specialist Currently Unavailable',
        `${provider.name || 'This service specialist'} is currently not accepting new service appointments. Please check back later or choose another specialist.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // 2. Pre-fill provider and service details for a brand new booking
    const providerObj = {
      _id: provider?._id || 'p_book_again',
      name: provider?.name || provider?.user?.name || 'Chaminda Wickramasinghe',
      category: item.category || provider?.category || 'Cleaner',
      specialization: provider?.specialization || 'Cleaning Specialist',
      avatar: provider?.avatar || provider?.user?.avatar,
      hourlyRate: provider?.hourlyRate || 500,
      isAvailable: true,
      user: {
        name: provider?.name || provider?.user?.name || 'Chaminda Wickramasinghe',
        avatar: provider?.avatar || provider?.user?.avatar,
      },
    };

    // 3. Take user to the existing booking flow with pre-filled details
    // Confirming in DateTimeSelection -> BookingDetails creates a brand NEW booking with a fresh ID and never modifies the old one
    try {
      navigation.navigate('DateTimeSelection', {
        provider: providerObj,
        prefilledService: item.serviceTitle,
      });
    } catch (err) {
      navigation.navigate('HomeTab', {
        screen: 'DateTimeSelection',
        params: {
          provider: providerObj,
          prefilledService: item.serviceTitle,
        },
      });
    }
    };
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isProvider ? 'My Dispatch Jobs' : 'Service Request History'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Segmented Tabs with Counters */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ongoing' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'ongoing' && styles.tabBtnTextActive]}>
            Ongoing ({ongoingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'completed' && styles.tabBtnTextActive]}>
            Completed ({completedBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {currentList.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={isProvider ? 'briefcase-outline' : 'calendar-outline'}
                size={42}
                color={colors.forestGreen}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'ongoing' ? 'No Ongoing Services' : 'No Completed History Yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              {isProvider
                ? activeTab === 'ongoing'
                  ? 'You currently have no jobs in progress. Check the Requests tab to accept upcoming assignments.'
                  : 'Your completed client jobs and payment settlements will appear here.'
                : activeTab === 'ongoing'
                ? 'You do not have any active service appointments right now.'
                : 'Your previous completed service bookings and official tax receipts will be archived here.'}
            </Text>
          </View>
        ) : (
          currentList.map((item) => {
            const isReceiptOpen = expandedReceiptId === item._id;

            return (
              <View key={item._id} style={styles.bookingCard}>
                {/* Top row: Ref and Status */}
                <View style={styles.cardHeader}>
                  <Text style={styles.bookingRefText}>#{item.bookingRef}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'Completed'
                        ? styles.statusBadgeCompleted
                        : item.status === 'Cancelled'
                        ? { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1 }
                        : styles.statusBadgeOngoing,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === 'Completed'
                          ? styles.statusTextCompleted
                          : item.status === 'Cancelled'
                          ? { color: '#DC2626' }
                          : styles.statusTextOngoing,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Service & Provider Details */}
                <View style={styles.providerRow}>
                  <Image source={{ uri: item.provider.avatar }} style={styles.providerThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
                    <Text style={styles.providerName}>{item.provider.name}</Text>
                    <Text style={styles.providerSpec}>{item.provider.specialization}</Text>
                  </View>
                </View>

                {/* Date & Time Slot */}
                <View style={styles.slotRow}>
                  <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.dateSlotText}>
                    {item.scheduledDate} • {item.timeSlot}
                  </Text>
                </View>

                {item.notes ? (
                  <View style={[styles.slotRow, { marginTop: 4 }]}>
                    <Ionicons name="document-text-outline" size={15} color={colors.forestGreen} style={{ marginRight: 6 }} />
                    <Text style={[styles.dateSlotText, { flex: 1, color: colors.textPrimary }]} numberOfLines={2}>
                      Special Instructions: {item.notes}
                    </Text>
                  </View>
                ) : null}

                {/* Card Actions */}
                <View style={styles.cardActionsRow}>
                  {activeTab === 'ongoing' ? (
                    <>
                      <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() => navigation.navigate('RequestStatusTracking', { booking: item })}
                      >
                        <Ionicons name="navigate-outline" size={16} color={colors.white} style={{ marginRight: 4 }} />
                        <Text style={styles.trackBtnText}>Track Service</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() => navigation.navigate('Chat', { booking: item })}
                      >
                        <Ionicons name="chatbubble-outline" size={16} color={colors.forestGreen} style={{ marginRight: 4 }} />
                        <Text style={styles.chatBtnText}>Chat</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.receiptBtn, isReceiptOpen && styles.receiptBtnActive]}
                        onPress={() => setExpandedReceiptId(isReceiptOpen ? null : item._id)}
                      >
                        <Ionicons
                          name={isReceiptOpen ? 'chevron-up' : 'receipt-outline'}
                          size={16}
                          color={isReceiptOpen ? colors.white : colors.forestGreen}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.receiptBtnText, isReceiptOpen && styles.receiptBtnTextActive]}>
                          {isReceiptOpen ? 'Hide Receipt' : 'View Receipt'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.bookAgainBtn}
                        onPress={() => handleBookAgain(item)}
                      >
                        <Ionicons name="repeat" size={16} color={colors.white} style={{ marginRight: 4 }} />
                        <Text style={styles.bookAgainBtnText}>Book Again</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Expandable Official Payment Receipt Card */}
                {activeTab === 'completed' && isReceiptOpen && (
                  <View style={styles.receiptCardWrapper}>
                    <View style={styles.receiptInnerCard}>
                      <View style={styles.receiptCardHeader}>
                        <View style={styles.brandIconCircle}>
                          <Ionicons name="checkmark-done" size={20} color={colors.forestGreen} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.receiptTitle}>Fixora Payment Receipt</Text>
                          <Text style={styles.receiptRefCode}>
                            Ref: #{item.bookingRef} • {item.transactionId || 'TXN-98432100'}
                          </Text>
                        </View>
                        <View style={styles.paidStampBadge}>
                          <Ionicons name="shield-checkmark" size={12} color="#15803D" style={{ marginRight: 3 }} />
                          <Text style={styles.paidStampText}>PAID</Text>
                        </View>
                      </View>

                      <View style={styles.amountDisplayBox}>
                        <Text style={styles.amountSub}>Total Settled in LKR</Text>
                        <Text style={styles.amountValue}>
                          Rs. {item.pricing?.totalAmount?.toLocaleString()}
                        </Text>
                        <Text style={styles.amountMethod}>Paid via Visa ending in 4892</Text>
                      </View>

                      {/* Breakdown */}
                      <View style={styles.receiptBreakdown}>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.bLabel}>Base Service Rate</Text>
                          <Text style={styles.bVal}>Rs. 2,500</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.bLabel}>Diagnostic & Labor Inspection</Text>
                          <Text style={styles.bVal}>Rs. 1,000</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.bLabel}>Fixora Guarantee & Platform Fee</Text>
                          <Text style={styles.bVal}>Rs. 250</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.breakdownRow}>
                          <Text style={styles.bTotalLabel}>Total Paid</Text>
                          <Text style={styles.bTotalVal}>
                            Rs. {item.pricing?.totalAmount?.toLocaleString()}
                          </Text>
                        </View>
                      </View>

                      {/* Download Receipt Button */}
                      <TouchableOpacity
                        style={styles.downloadPdfBtn}
                        onPress={() => handleDownloadReceipt(item)}
                        activeOpacity={0.85}
                        disabled={downloadingId === item._id}
                      >
                        {downloadingId === item._id ? (
                          <ActivityIndicator color={colors.white} size="small" style={{ marginRight: 6 }} />
                        ) : (
                          <Ionicons name="download-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
                        )}
                        <Text style={styles.downloadPdfText}>
                          {downloadingId === item._id ? 'Generating Tax Invoice...' : 'Download Tax Invoice (PDF)'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Official Tax Invoice In-App Preview Modal */}
      <Modal visible={!!selectedInvoice} transparent animationType="slide">
        <View style={styles.invoiceModalOverlay}>
          <View style={styles.invoiceModalContent}>
            <View style={styles.invoiceModalHeader}>
              <View>
                <Text style={styles.invoiceModalTitle}>Official Tax Invoice</Text>
                <Text style={styles.invoiceModalSub}>
                  {selectedInvoice?.invoiceNumber} • {selectedInvoice?.invoiceDate}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)} style={styles.invoiceCloseBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.invoiceScroll}>
              <View style={styles.invoicePaperCard}>
                {/* Brand & Status */}
                <View style={styles.invBrandRow}>
                  <View>
                    <Text style={styles.invBrandName}>FIXORA</Text>
                    <Text style={styles.invBrandSub}>PLATFORM TECHNOLOGIES (PVT) LTD</Text>
                    <Text style={styles.invTaxNo}>VAT Reg: LK-VAT-8849201</Text>
                  </View>
                  <View style={styles.invPaidBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#15803D" style={{ marginRight: 4 }} />
                    <Text style={styles.invPaidText}>PAID</Text>
                  </View>
                </View>

                <View style={styles.invDivider} />

                {/* Customer & Booking Details */}
                <View style={styles.invMetaGrid}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.invMetaHeading}>Billed To (Customer)</Text>
                    <Text style={styles.invMetaTextBold}>{selectedInvoice?.customerName}</Text>
                    <Text style={styles.invMetaText}>{selectedInvoice?.customerPhone}</Text>
                    <Text style={styles.invMetaText}>{selectedInvoice?.customerAddress}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invMetaHeading}>Booking Ref</Text>
                    <Text style={styles.invMetaTextBold}>#{selectedInvoice?.item?.bookingRef}</Text>
                    <Text style={styles.invMetaText}>TXN: {selectedInvoice?.transactionId}</Text>
                    <Text style={styles.invMetaText}>Specialist: {selectedInvoice?.providerName}</Text>
                  </View>
                </View>

                <View style={styles.invDivider} />

                {/* Itemized Table */}
                <Text style={styles.invMetaHeading}>Itemized Charges (LKR)</Text>
                <View style={styles.invTableRow}>
                  <Text style={styles.invTableDesc}>Base Professional Service</Text>
                  <Text style={styles.invTableAmount}>Rs. {selectedInvoice?.baseRate?.toLocaleString()}</Text>
                </View>
                <View style={styles.invTableRow}>
                  <Text style={styles.invTableDesc}>Diagnostic Labor & Inspection</Text>
                  <Text style={styles.invTableAmount}>Rs. {selectedInvoice?.laborRate?.toLocaleString()}</Text>
                </View>
                <View style={styles.invTableRow}>
                  <Text style={styles.invTableDesc}>Platform & Safety Warranty Fee</Text>
                  <Text style={styles.invTableAmount}>Rs. {selectedInvoice?.platformFee?.toLocaleString()}</Text>
                </View>
                <View style={styles.invTableRow}>
                  <Text style={styles.invTableDesc}>VAT (0% Residential Exemption)</Text>
                  <Text style={styles.invTableAmount}>Rs. 0</Text>
                </View>

                <View style={[styles.invDivider, { marginVertical: 12 }]} />

                <View style={styles.invTotalRow}>
                  <Text style={styles.invTotalLabel}>Total Paid:</Text>
                  <Text style={styles.invTotalValue}>
                    Rs. {selectedInvoice?.totalAmount?.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.invPaymentMethodText}>
                  Settled via {selectedInvoice?.paymentMethod}
                </Text>

                <View style={styles.invFooterNote}>
                  <Text style={styles.invFooterText}>
                    Computer-generated official tax invoice verified by Fixora Platform Technologies (Pvt) Ltd.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.invoiceModalActionRow}>
              <TouchableOpacity
                style={styles.invoicePrintBtn}
                onPress={async () => {
                  try {
                    if (Print && typeof Print.printAsync === 'function') {
                      await Print.printAsync({ html: selectedInvoice?.htmlContent });
                    }
                  } catch (e) {
                    Alert.alert('Print Error', e.message);
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="print-outline" size={16} color={colors.forestGreen} style={{ marginRight: 5 }} />
                <Text style={styles.invoicePrintBtnText}>Print</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.invoiceShareBtn}
                onPress={async () => {
                  try {
                    if (selectedInvoice?.pdfUri && Sharing && typeof Sharing.isAvailableAsync === 'function') {
                      await Sharing.shareAsync(selectedInvoice.pdfUri, {
                        mimeType: 'application/pdf',
                        dialogTitle: `Download Tax Invoice #${selectedInvoice.item?.bookingRef}`,
                        UTI: 'com.adobe.pdf',
                      });
                    } else if (Print && typeof Print.printToFileAsync === 'function') {
                      const res = await Print.printToFileAsync({ html: selectedInvoice?.htmlContent });
                      if (res?.uri && Sharing && typeof Sharing.isAvailableAsync === 'function') {
                        await Sharing.shareAsync(res.uri, {
                          mimeType: 'application/pdf',
                          dialogTitle: `Download Tax Invoice #${selectedInvoice.item?.bookingRef}`,
                          UTI: 'com.adobe.pdf',
                        });
                      }
                    } else if (Print && typeof Print.printAsync === 'function') {
                      await Print.printAsync({ html: selectedInvoice?.htmlContent });
                    }
                  } catch (e) {
                    console.log('Share error or dismissed:', e.message);
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={16} color={colors.white} style={{ marginRight: 5 }} />
                <Text style={styles.invoiceShareBtnText}>Download PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.invoiceCloseModalBtn}
                onPress={() => setSelectedInvoice(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.invoiceCloseModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.forestGreen,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingRefText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeOngoing: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOngoing: {
    color: '#92400E',
  },
  statusTextCompleted: {
    color: '#15803D',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerThumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  providerName: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  providerSpec: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateSlotText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    height: 40,
    borderRadius: 10,
  },
  trackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.forestGreen,
    height: 40,
    borderRadius: 10,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  receiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4EE',
    borderWidth: 1,
    borderColor: colors.forestGreen,
    height: 40,
    borderRadius: 10,
  },
  receiptBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  receiptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  receiptBtnTextActive: {
    color: colors.white,
  },
  bookAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    height: 40,
    borderRadius: 10,
  },
  bookAgainBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  receiptCardWrapper: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  receiptInnerCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  receiptCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  receiptRefCode: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  paidStampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidStampText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  amountDisplayBox: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreen,
    marginVertical: 2,
  },
  amountMethod: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  receiptBreakdown: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  bLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  bTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    paddingVertical: 10,
    borderRadius: 10,
  },
  downloadPdfText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  invoiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  invoiceModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  invoiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  invoiceModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  invoiceModalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  invoiceCloseBtn: {
    padding: 4,
  },
  invoiceScroll: {
    marginBottom: 12,
  },
  invoicePaperCard: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#D1E7D6',
    borderRadius: 14,
    padding: 16,
  },
  invBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invBrandName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.forestGreen,
    letterSpacing: 1.5,
  },
  invBrandSub: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.emerald,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  invTaxNo: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  invPaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  invPaidText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  invDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  invMetaGrid: {
    flexDirection: 'row',
  },
  invMetaHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  invMetaTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  invMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  invTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  invTableDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  invTableAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  invTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  invTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.forestGreen,
  },
  invPaymentMethodText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  invFooterNote: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  invFooterText: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
  },
  invoiceModalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  invoicePrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4EE',
    borderWidth: 1,
    borderColor: colors.forestGreen,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  invoicePrintBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  invoiceShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1.4,
  },
  invoiceShareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  invoiceCloseModalBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  invoiceCloseModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
