package com.web.api;

import com.web.dto.request.PaymentDto;
import com.web.dto.request.ProductSizeRequest;
import com.web.dto.response.ResponsePayment;
import com.web.entity.ProductSize;
import com.web.entity.Voucher;
import com.web.exception.MessageException;
import com.web.repository.ProductSizeRepository;
import com.web.servive.VoucherService;
import com.web.vnpay.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/vnpay")
@CrossOrigin
public class VnpayApi {

    @Autowired
    private ProductSizeRepository productSizeRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VNPayService vnPayService;


    @PostMapping("/urlpayment")
    public ResponsePayment getUrlPayment(@RequestBody PaymentDto paymentDto){
        Double totalAmount = 0D;
        for(ProductSizeRequest p : paymentDto.getListProductSize()){
            if(p.getIdProductSize() == null){
                throw new MessageException("id product size require");
            }
            Optional<ProductSize> productSize = productSizeRepository.findById(p.getIdProductSize());
            if(productSize.isEmpty()){
                throw new MessageException("product size: "+p.getIdProductSize()+" not found");
            }
            if(productSize.get().getQuantity() < p.getQuantity()){
                throw new MessageException("product size: "+p.getIdProductSize()+" not enough quantity");
            }
            totalAmount += productSize.get().getProductColor().getProduct().getPrice() * p.getQuantity();
        }
        if(paymentDto.getCodeVoucher() != null){
            Optional<Voucher> voucher = voucherService.findByCode(paymentDto.getCodeVoucher(), totalAmount);
            if(voucher.isPresent()){
                totalAmount = totalAmount - voucher.get().getDiscount();
            }
        }
        totalAmount += 20000;
        String orderId = String.valueOf(System.currentTimeMillis());
        String vnpayUrl = vnPayService.createOrder(totalAmount.intValue(), orderId, paymentDto.getReturnUrl());
        ResponsePayment responsePayment = new ResponsePayment(vnpayUrl,orderId,null);
        return responsePayment;
    }
}
